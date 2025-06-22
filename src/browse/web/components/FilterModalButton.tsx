import "../assets/styles/FilterModal.scss";
import "../assets/styles/FilterModalButton.scss";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import copy from 'fast-copy';
import deepEqual from 'deep-equal';
import { type Filter, type FilterOption, type FilterSearchParams, type FilterSection, type FilterData } from "../../types/Filter";
import { Button, Modal, Form, Stack, ToggleButton } from "react-bootstrap";
import { useSearchParams } from "react-router";
import { useBrowseSettings } from "../contexts/BrowseSettingsProvider";

interface FilterModalButtonProps<S extends FilterSearchParams> {
  options: FilterData<S>;
  onFilter: (filter: Filter<S>) => void;
}

function getFilterValuesFromSearchParams<S extends FilterSearchParams>(searchParams: URLSearchParams): Filter<S>['options'] {
  const values: Filter<S>['options'] = [];
  for (const [p, v] of searchParams.entries()) {
    if (p.startsWith('filter_')) {
      const p2 = p.substring('filter_'.length);
      if (p2) {
        values.push({
          searchParam: p2 as S,
          value: v
        });
      }
    }
  }
  return values;
}

function getInitialFilterValues<S extends FilterSearchParams>(options: FilterData<S>) {
  const result: Filter<S>['options'] = [];
  for (const section of options.sections) {
    const defaultOption = section.options.find((option) => option.isDefault);
    const value = defaultOption?.value || null;
    result.push({
      searchParam: section.searchParam,
      value
    });
  }
  return result;
}

function isSelected<S extends FilterSearchParams>(filter: Filter<S>, section: FilterSection<S>, option: FilterOption) {
  const filterValue = filter.options.find((fo) =>
    fo.searchParam === section.searchParam)?.value;
  if (filterValue === undefined) {
    return false;
  }
  return filterValue === option.value;
}

const contentFilterReducer = <S extends FilterSearchParams>(currentFilter: Filter<S> | null, options: Filter<S>['options']) => {
  if (currentFilter && options) {
    const result = copy(currentFilter);
    for (const option of options) {
      const ro = result.options.find((o) => o.searchParam === option.searchParam);
      if (ro) {
        ro.value = option.value;
      }
      else {
        result.options.push({...option})
      }
    }
    return deepEqual(currentFilter, result) ? currentFilter : result;
  }
  const newFilter = currentFilter ? { ...currentFilter, options } : { options };
  return deepEqual(currentFilter, newFilter) ? currentFilter : newFilter;
};

function FilterModalButton<S extends FilterSearchParams>(props: FilterModalButtonProps<S>) {
  const { options: filterOptions, onFilter } = props;
  const { settings } = useBrowseSettings();
  const [ searchParams, setSearchParams ] = useSearchParams();
  const [modalFilter, setModalFilterValues] = useReducer(contentFilterReducer, null);
  const [appliedFilter, setAppliedFilterValues] = useReducer(contentFilterReducer, null);
  const [modalVisible, setModalVisible] = useState(false);
  const initialFilterValuesRef = useRef<Filter<S>['options'] | null>(null);

  useEffect(() => {
    if (!filterOptions) {
      return;
    }
    let initialValues: Filter<S>['options'] = [];
    initialValues = getInitialFilterValues(filterOptions);
    initialFilterValuesRef.current = copy(initialValues);
    const spValues = getFilterValuesFromSearchParams<S>(searchParams);
    for (const sp of spValues) {
      const v = initialValues.find((value) => value.searchParam === sp.searchParam);
      if (v) {
        v.value = sp.value;
      }
      else {
        initialValues.push(sp);
      }
    }
    setModalFilterValues(initialValues);
    setAppliedFilterValues(initialValues);
  }, [filterOptions, searchParams]);

  useEffect(() => {
    const initialValues = initialFilterValuesRef.current;
    if (appliedFilter && initialValues) {
      onFilter(copy(appliedFilter) as Filter<S>);
    }
  }, [appliedFilter, onFilter]);

  const handleFilterValueSelect = useCallback((
    section: FilterSection<S>,
    option: FilterOption,
    isToggleable = false
  ) => {
    if (!modalFilter) {
      return;
    }
    const modalValue = modalFilter.options.find((mv) => mv.searchParam === section.searchParam);
    if (modalValue) {
      const value = isToggleable ?
        (option.value === modalValue.value ? null : option.value)
        : option.value;
      if (modalValue.value !== value) {
        setModalFilterValues([{
          searchParam: modalValue.searchParam,
          value
        }]);
      }
    }
  }, [modalFilter]);

  const isSectionDisabled = useCallback((section: FilterSection<S>) => {
    if (!section.enableCondition || !modalFilter) {
      return false;
    }
    const { searchParam, condition, value } = section.enableCondition;
    const o = modalFilter.options.find((o) => o.searchParam === searchParam);
    if (o) {
      switch (condition) {
        case 'is':
          return o.value === value;
        case 'not':
          return o.value !== value;
      }
    }
    return undefined as never;
  }, [modalFilter])

  const sectionEls = useMemo(() => {
    if (!modalFilter || !filterOptions) {
      return null;
    }
    return filterOptions.sections.map((section) => {
      let mainContentEl: React.ReactElement;
      switch (section.displayHint) {
        case 'list': {
          const optionEls = section.options.map((option) => (
            <Form.Check
              key={`${section.searchParam}:${option.value}`}
              type="radio"
              id={`filter-select-${section.searchParam}:${option.value}`}
              name={section.searchParam}
              label={option.title}
              checked={isSelected(modalFilter, section, option)}
              onClick={() => handleFilterValueSelect(section, option)}
            />
          ));
          mainContentEl = (
            <Stack gap={2}>{...optionEls}</Stack>
          )
          break;
        }
        case 'pill': {
          // 'outline-primary' in Vapor theme sticks to the background - need to use secondary
          const variant = settings.theme.toLowerCase() === 'vapor' ? 'outline-secondary' : 'outline-primary';
          const optionEls = section.options.map((option) => (
            <ToggleButton
              key={`${section.searchParam}:${option.value}`}
              type="checkbox"
              id={`filter-select-${section.searchParam}:${option.value}`}
              checked={isSelected(modalFilter, section, option)}
              value={option.value || ''}
              variant={variant}
              onChange={() => handleFilterValueSelect(section, option, true)}
            >
              {option.title}
            </ToggleButton>
          ));
          mainContentEl = (
            <Stack direction="horizontal" gap={2}>
              {...optionEls}
            </Stack>
          )
          break;
        }
      }
      const titleEl = section.title ? <h5 style={{paddingBottom: '0.5em'}}>{section.title}</h5> : null;
      const contentClassName = section.title ? '' : 'py-4 border-top border-bottom';
      const sectionClassName = isSectionDisabled(section) ? 'filter-modal__section--hidden' : '';
      return (
        <div
          key={`filter-modal-section-${section.searchParam}`}
          className={`filter-modal__section ${sectionClassName}`}
        >
          <Stack
            className={contentClassName}
          >
            {titleEl}
            {mainContentEl}
          </Stack>
        </div>
      )
    })
  }, [modalFilter, filterOptions, handleFilterValueSelect, isSectionDisabled, settings.theme]);

  const showModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setModalVisible(false);
    if (appliedFilter) {
      setModalFilterValues(appliedFilter.options);
    }
  }, [appliedFilter]);

  const handleApply = useCallback(() => {
    const initialValues = initialFilterValuesRef.current;
    if (!modalFilter || !initialValues) {
      return;
    }
    const sanitizedOptions = copy(modalFilter.options);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      for (const option of modalFilter.options) {
        const iv = initialValues.find((o) => o.searchParam === option.searchParam);
        const paramName = `filter_${option.searchParam}`;
        // Check if option belongs to a disabled section
        const section = filterOptions.sections.find((s) => s.searchParam === option.searchParam);
        let optionValue: string | null | undefined;
        if (section && isSectionDisabled(section) && iv) {
          optionValue = iv.value;
          const so = sanitizedOptions.find((s) => s.searchParam === option.searchParam);
          if (so) {
            so.value = iv.value;
          }
        }
        else {
          optionValue = option.value;
        }
        if (optionValue && (iv === undefined || iv.value !== optionValue)) {
          params.set(paramName, optionValue);
        }
        else {
          params.delete(paramName);
        }
      }
      return params;
    });
    setAppliedFilterValues(sanitizedOptions);
    setModalVisible(false);
  }, [modalFilter, setSearchParams, filterOptions, isSectionDisabled]);

  const handleClear = useCallback(() => {
    const initialValues = initialFilterValuesRef.current;
    if (initialValues) {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        for (const iv of initialValues) {
          const paramName = `filter_${iv.searchParam}`;
          params.delete(paramName);
        }
        return params;
      });
      setModalFilterValues(initialValues);
      setAppliedFilterValues(initialValues);
    }
    setModalVisible(false);
  }, [setSearchParams]);

  if (!sectionEls) {
    return null;
  }

  const hasCustomSelection = appliedFilter && initialFilterValuesRef.current ? 
    !deepEqual(appliedFilter.options, initialFilterValuesRef.current) : false;

  return (
    <Stack direction="horizontal" gap={2}>
      <Button
        className="filter-modal-button filter-modal-button--show"
        variant={hasCustomSelection ? 'primary' : 'outline-primary'}
        onClick={showModal}
      >
        Filters
      </Button>
      {
        hasCustomSelection ? (
          <Button
            className="filter-modal-button filter-modal-button--clear"
            variant="secondary"
            onClick={handleClear}
          >
            Clear filters
          </Button>
        ): null
      }
      <Modal
        show={modalVisible}
        onHide={hideModal}
        centered
        scrollable
      >
        <Modal.Header closeButton />

        <Modal.Body>
          <Stack>
            {...sectionEls}
          </Stack>
        </Modal.Body>

        <Modal.Footer className="justify-content-between">
          <Button
            variant="secondary"
            onClick={handleClear}
          >
            Clear all
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
          >
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </Stack>
  )
}

export default FilterModalButton;