window.handleError = ({ error = "", cb = () => {} }) => {
    alert(JSON.stringify(error));
    cb(error);
};
