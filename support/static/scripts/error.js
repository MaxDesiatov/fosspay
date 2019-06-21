window.handleServerError = ({ error = "", cb = () => {} }) => {
    alert(error);
    cb(error);
};
