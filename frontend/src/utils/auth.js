// The logged-in user is saved in localStorage under "user"
// by LoginPage / SignupPage: { username, name, phoneNumber, role, token }

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("user");
};
