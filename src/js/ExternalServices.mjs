const baseURL =
  import.meta.env?.VITE_SERVER_URL || "https://wdd330-backend.onrender.com/";

async function convertToJson(res) {
  const jsonResponse = await res.json();
  if (res.ok) {
    return jsonResponse;
  } else {
    throw { name: 'servicesError', message: JSON.stringify(jsonResponse) };
  }
}

export function hasAuthenticatedSession() {
  return (
    Boolean(sessionStorage.getItem("so-auth-token")) ||
    sessionStorage.getItem("so-authenticated") === "true"
  );
}

export default class ExternalServices {
  constructor(category) { }

  async getData(category) {
    const response = await fetch(`${baseURL}products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result;
  }
  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async checkout(orderData) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    };
    const response = await fetch(`${baseURL}checkout`, options);
    const data = await convertToJson(response);
    return data;
  }

  async registerUser(userData) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    };
    const response = await fetch(`${baseURL}users`, options);
    return convertToJson(response);
  }

  async getUsers() {
    const response = await fetch(`${baseURL}users`);
    const data = await convertToJson(response);
    const users = data?.Result ?? data;
    if (!Array.isArray(users)) {
      throw new Error("The users endpoint returned an invalid response.");
    }
    return users;
  }
}
