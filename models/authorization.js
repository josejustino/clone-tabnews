function can(user, feature) {
  let authorized = false;
  console.log("user: ", user, feature);
  if (user.features.includes(feature)) {
    authorized = true;
  }

  return authorized;
}

const authorization = {
  can,
};

export default authorization;
