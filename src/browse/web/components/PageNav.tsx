import WebUtils from '../../../utils/WebUtils';
import { Button, ButtonGroup } from 'react-bootstrap';
import PageInputButton from './PageInputButton';

interface PageNavProps {
  totalItems: number;
  itemsPerPage: number;
  onChange: (page: number) => void;
}

interface PageNavLink {
  page: number;
  isCurrent: boolean;
}

interface PageNavData {
  currentPage: number;
  totalPages: number;
  previousPage: number | null;
  nextPage: number | null;
  // Sections should be rendered with "..." in-between
  sections: Array<PageNavLink[]>;
}

const MAX_LINKS = 10;

function getPageNavData(
  totalItems: number,
  itemsPerPage: number
): PageNavData | null {
  const location = window.location.href;
  const { limit, offset: currentOffset } = WebUtils.getPaginationParams(
    location,
    itemsPerPage
  );
  const totalPages = Math.ceil(totalItems / limit);
  if (totalPages === 1) {
    return null;
  }
  const sections: PageNavData['sections'] = [];
  const currentPage = Math.floor(currentOffset / limit) + 1;
  // All pages numbers can be displayed
  // So if MAX_LINKS = 10, then we would expect:
  // 1 2 3 4 5 6 7 8 9 10
  if (totalPages <= MAX_LINKS) {
    sections.push(
      getPageNavLinks(1, totalPages, currentPage)
    );
  }
  // Current page is in first section
  // MAX_LINKS - 1 to account for the last link
  // So if MAX_LINKS = 10 and total pages is 23, then we would expect:
  // 1 2 3 4 5 6 8 9 ... 23
  else if (currentPage < MAX_LINKS - 1) {
    sections.push(
      getPageNavLinks(
        1,
        MAX_LINKS - 1,
        currentPage
      )
    );
    sections.push(
      getPageNavLinks(
        totalPages,
        totalPages,
        currentPage
      )
    );
  }
  // Current page is in last section
  // MAX_LINKS + 2 to account for the first link
  // So if MAX_LINKS = 10 and total pages is 23, then we would expect:
  // 1...15 16 17 18 19 20 21 22 23
  else if (currentPage >= totalPages - MAX_LINKS + 2) {
    sections.push(
      getPageNavLinks(1, 1, currentPage)
    );
    sections.push(
      getPageNavLinks(
        totalPages - MAX_LINKS + 2,
        totalPages,
        currentPage
      )
    );
  }
  // Current page is in middle section
  // If MAX_LINKS = 10, total pages is 83 and current is 25, then we would expect:
  // 1 ... 23 24 25 26 27 28 29 30 ... 83
  else {
    sections.push(
      getPageNavLinks(1, 1, currentPage)
    );
    let currentSection =
      Math.floor(currentPage / (MAX_LINKS - 2)) + 1;
    // Each section has MAX_LINKS - 2 links
    // Extra -1 so that starting page becomes the last page of the previous section
    let currentSectionStartingPage =
      2 + (currentSection - 1) * (MAX_LINKS - 3);
    let currentSectionEndingPage =
      currentSectionStartingPage + MAX_LINKS - 3;
    // Sometimes currentSection is one less actual
    if (currentPage >= currentSectionEndingPage) {
      currentSection++;
      currentSectionStartingPage += MAX_LINKS - 3;
      currentSectionEndingPage += MAX_LINKS - 3;
    }
    // Check if we have run into the situation where currentSectionEndingPage is
    // the second last page. If so, just include the last page into the section, because it
    // would be wierd to have something like: 1 ... 23 24 25 26 27 28 29 30 ... 31
    if (currentSectionEndingPage === totalPages - 1) {
      sections.push(
        getPageNavLinks(
          currentSectionStartingPage,
          totalPages,
          currentPage
        )
      );
    } else {
      sections.push(
        getPageNavLinks(
          currentSectionStartingPage,
          currentSectionEndingPage,
          currentPage
        )
      );
      sections.push(
        getPageNavLinks(
          totalPages,
          totalPages,
          currentPage
        )
      );
    }
  }
  const previous =
    currentPage > 1 ?
      getPageNavLinks(
        currentPage - 1,
        currentPage - 1,
        currentPage
      )[0].page
      : null;
  const next =
    currentPage < totalPages ?
      getPageNavLinks(
        currentPage + 1,
        currentPage + 1,
        currentPage,
      )[0].page
      : null;
  return {
    currentPage,
    totalPages,
    sections,
    previousPage: previous,
    nextPage: next
  };
}

function getPageNavLinks(
  fromPage: number,
  toPage: number,
  currentPage: number
): PageNavLink[] {
  const links: PageNavLink[] = [];
  for (let page = fromPage; page <= toPage; page++) {
    links.push({
      page,
      isCurrent: page === currentPage
    });
  }
  return links;
}

function PageNav(props: PageNavProps) {
  const { totalItems, itemsPerPage, onChange } = props;

  const pageNavData = getPageNavData(totalItems, itemsPerPage);

  if (!pageNavData) {
    return null;
  }

  const handleNavLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const page = e.currentTarget.dataset.page;
    if (page !== undefined && !isNaN(Number(page))) {
      onChange(Number(page));
    }
  }

  const els: React.ReactElement[] = [];

  if (pageNavData.previousPage) {
    els.push(<Button variant='outline-primary' onClick={handleNavLinkClick} data-page={pageNavData.previousPage}>&lt;</Button>);
  }

  for (let i = 0; i < pageNavData.sections.length; i++) {
    const section = pageNavData.sections[i];
    els.push(...section.map((link) => {
      const onClick = link.isCurrent ? undefined : handleNavLinkClick;
      const variant = link.isCurrent ? "primary" : "outline-primary";
      return (
        <Button variant={variant} onClick={onClick} data-page={link.page}>
          {link.page}
        </Button>
      )
    }));
    if (i < pageNavData.sections.length - 1) {
      els.push((
        <PageInputButton
          currentPage={pageNavData.currentPage}
          totalPages={pageNavData.totalPages}
          onChange={onChange}
        />
      ));
    }
  }

  if (pageNavData.nextPage) {
    els.push((
      <Button variant='outline-primary' onClick={handleNavLinkClick} data-page={pageNavData.nextPage}>&gt;</Button>
    ));
  }

  return (
    <div className="d-flex justify-content-center">
      <ButtonGroup className="mt-2 mb-4">
        { els }
      </ButtonGroup>
    </div>
  )

}

export default PageNav;