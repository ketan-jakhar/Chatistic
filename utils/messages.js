const moment = require("moment");

const formatMessage = (username, text) => {
	return {
		username,
		text,
		time: moment().format("h:mm a"),
		date: moment().format("d-m-Y"),
	};
};

module.exports = formatMessage;
