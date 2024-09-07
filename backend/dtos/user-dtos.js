class Userdto{
    id;
    email;
    name;
    constructor(user){
        this.id = user._id;
        this.email = user.email;
        this.created_at = user.created_at;
    }
}
module.exports = Userdto;