import './App.css';
import DrugEditor from './Components/Tools/index';

import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  spacing: 2,
});

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <DrugEditor />
      </ThemeProvider>

    </div>
  );
}

export default App;
