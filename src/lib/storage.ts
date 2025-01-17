
export const setItem = async (key:string, value:string) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting item:', error);
  }
};

export const getItem = async (key:string) => {
  try {
    const value = window.localStorage.getItem(key);
    return value != null ? JSON.parse(value) : "";
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};
