export const registerUser = async (userData) => {
  const res = await fetch("https://kbptb.onrender.com/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  return await res.json();
};

export const loginUser = async (userData) => {
  const res = await fetch("https://kbptb.onrender.com/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  return await res.json();
};

