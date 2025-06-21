import "material-icons/iconfont/material-icons.css";
import "./assets/styles/App.scss";
import { APIProvider } from "./contexts/APIProvider";
import { Routes, Route } from 'react-router';
import CampaignList from "./pages/CampaignList";
import MainLayout from './layouts/MainLayout';
import CampaignContent from './pages/CampaignContent';
import CampaignLayout from './layouts/CampaignLayout';
import AboutCampaign from './pages/AboutCampaign';
import CampaignHome from './pages/CampaignHome';
import PostContent from './pages/PostContent';
import { BrowseSettingsProvider } from './contexts/BrowseSettingsProvider';
import Theme from "./components/Theme";
import { GlobalModalsProvider } from "./contexts/GlobalModalsProvider";
import CampaignMedia from "./pages/CampaignMedia";
import ProductContent from "./pages/ProductContent";

function App() {
  return (
    <APIProvider>
      <BrowseSettingsProvider>
        <Theme />
        <GlobalModalsProvider>
          <Routes>
            <Route path="/" element={<MainLayout />} >
              <Route index element={<CampaignList />} />
              <Route path="creators" element={<CampaignList />} />
              <Route path="campaigns/:id" element={<CampaignLayout />}>
                <Route index element={<CampaignHome />} />
                <Route path="posts" element={<CampaignContent type="post" />} />
                <Route path="shop" element={<CampaignContent type="product" />} />
                <Route path="media" element={<CampaignMedia />} />
                <Route path="about" element={<AboutCampaign />} />
              </Route>
              <Route path="posts/:id" element={<PostContent />} />
              <Route path="products/:id" element={<ProductContent />} />
            </Route>
          </Routes>
        </GlobalModalsProvider>
      </BrowseSettingsProvider>
    </APIProvider>
  )
}

export default App;
