import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fredoka/latin-400.css';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import './styles/base.css';
import './styles/screens.css';
import './styles/characters.css';
import './styles/adult.css';
import { App } from './app/App';

const ArtGallery = import.meta.env.DEV ? lazy(() => import('./dev/ArtGallery')) : null;
const showGallery = ArtGallery && new URLSearchParams(window.location.search).has('gallery');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {showGallery && ArtGallery ? (
      <Suspense fallback={null}>
        <ArtGallery />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
