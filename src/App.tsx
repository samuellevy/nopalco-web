import { ThemeProvider } from 'styled-components';
import { Router } from './main/router';
import { GlobalStyles } from './presentation/styles/global';
import { defaultTheme } from './presentation/styles/themes/default';

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyles />
      <Router />
    </ThemeProvider>
  );
}

export default App;
