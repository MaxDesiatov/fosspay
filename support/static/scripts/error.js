window.handleServerError = ({ error = "", cb = () => {} }) => {
    alert(JSON.stringify(error));
    cb(error);
};
