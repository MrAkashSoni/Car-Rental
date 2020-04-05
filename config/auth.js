module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()){
            return next();
        }
        res.redirect('/user/login');
    },
    notLoggedIn: (req, res, next) => {
        if (!req.isAuthenticated()){
            return next();
        }
        res.redirect('/');
    },
    isAdmin: (req, res, next) => {
        if (req.user) {
            currentUser = req.user;   
            if(currentUser.isAdmin) {
                return next();
            }
            else {
                res.redirect('/');
            }
        }
        else {
            res.redirect('/user/login');
        }
    },
    isSuperAdmin: (req, res, next) => {
        if (req.user) {
            currentUser = req.user;   
            if(currentUser.isSuperAdmin) {
                return next();
            }
            else {
                res.redirect('/');
            }
        }
        else {
            res.redirect('/user/login');
        }
    }
}