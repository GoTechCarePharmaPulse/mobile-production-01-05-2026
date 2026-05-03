import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => setDark(!dark);

  const theme = {
    background: dark ? "#121212" : "#ffffff",
    text: dark ? "#ffffff" : "#000000",
    card: dark ? "#1e1e1e" : "#f5f5f5",
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
