import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DesignerPage from './pages/DesignerPage';
import './App.css';
import {Frame, TopBar, Navigation, Loading, Toast} from '@shopify/polaris';
import {HomeMajor} from '@shopify/polaris-icons';
import { useAppBridge } from '@shopify/app-bridge-react'; // Import useAppBridge


function App() {
    const appBridge = useAppBridge();
    const [toastActive, setToastActive] = React.useState(false);
    const toggleToastActive = React.useCallback(() => setToastActive((toastActive) => !toastActive), []);

    const toastMarkup = toastActive ? (
        <Toast content="Successfully loaded" onDismiss={toggleToastActive} />
    ) : null;

    const userMenuMarkup = (
        <TopBar.UserMenu name="User Name" detail="User Details"/> //Customize as per your needs
    );

    const topBarMarkup = (
        <TopBar
            showNavigationToggle
            userMenu={userMenuMarkup}
        />
    );

    const navigationMarkup = (
        <Navigation location="/">
          <Navigation.Section
            items={[
              {
                url: '/',
                label: 'Designer',
                icon: HomeMajor,
              },
              //Add more navigation items as needed
            ]}
          />
        </Navigation>
      );

    //Add a Loading Component
    const loadingMarkup = <Loading />;
  return (
        <Frame topBar={topBarMarkup} navigation={navigationMarkup} loading={loadingMarkup}>
            {toastMarkup}
            <Routes>
                <Route path="/" element={<DesignerPage />} />
            </Routes>
        </Frame>
  );
}

export default App;