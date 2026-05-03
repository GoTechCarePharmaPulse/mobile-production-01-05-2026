import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {

 const [lang, setLang] = useState("en");

 const toggleLanguage = () => {
   setLang(prev => (prev === "en" ? "hi" : "en"));
 };

 return (
   <LanguageContext.Provider value={{ lang, toggleLanguage }}>
     {children}
   </LanguageContext.Provider>
 );
};

export const useLanguage = () => useContext(LanguageContext);