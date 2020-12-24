export const transformSettings = (data) => {
  const settingsObject = {};
  data.forEach((setting) => {
    settingsObject[setting.key] = setting.value;
  });
  return settingsObject;
};

export const transformCountries = (data) => {
  const countriesList = [];
  Object.keys(data).forEach((key) => {
    countriesList.push({ id: key, name: data[key] });
  });
  return countriesList;
};
