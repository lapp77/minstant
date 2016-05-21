// subscriptions - allow read access to collections
Meteor.subscribe("users");
Meteor.subscribe("chats");

// set up the main template the the router will use to build pages
Router.configure({
    layoutTemplate: 'ApplicationLayout'
});

Router.onBeforeAction(function() {
    if (!Meteor.userId()) {
        Router.go('index');
    } else {
        this.next();
    }
}, {
    only: ['chat']
});

// specify the top level route, the page users see when they arrive at the site
Router.route('/', function () {
    this.render("navbar", {to: "header"});
    this.render("lobby_page", {to: "main"});
}, {
    name: 'index'
});

// specify a route that allows the current user to chat to another users
Router.route('/chat/:_id', function () {
    // the user they want to chat to has id equal to 
    // the id sent in after /chat/... 
    var otherUserId = this.params._id;

    Meteor.call("addChat", otherUserId, function(error, chatId) {
        if (error) {
            alert(error.reason);
        }
        else {
            Session.set("chatId", chatId);
        }
    });

    this.render("navbar", {to: "header"});
    this.render("chat_page", {to: "main"});
}, {
    name: 'chat'
});

///
// helper functions 
///
Template.registerHelper("isMyUser", function(userId) {
    return userId === Meteor.userId();
});

Template.available_user_list.helpers({
    users: function() {
        return Meteor.users.find();
    }
});

Template.available_user.helpers({
    getUsername: function(userId) {
        var user = Meteor.users.findOne({_id: userId});
        return user.profile.username;
    }
});

Template.chat_page.helpers({
    messages: function() {
        var chat = Chats.findOne({_id: Session.get("chatId")});
        return chat.messages;
    },
    emoticons: function() {
        return Meteor.settings.public.coreEmoticons;
    }
});

Template.chat_message.helpers({
    getUserAvatar: function(userId) {
        var user = Meteor.users.findOne({_id: userId});
        return user.profile.avatar;
    }
});

Template.chat_page.events({
    // this event fires when the user sends a message on the chat page
    'submit .js-send-chat': function(event) {
        // stop the form from triggering a page reload
        event.preventDefault();
        
        Meteor.call("addChatMessage", Session.get("chatId"), event.target.chat.value, function() {
            event.target.chat.value = "";
        });
    },
    'click .js-insert-emoticon': function(event) {
        var chatInput = $('input[name=chat]');
        chatInput.val(chatInput.val() + ' ' + event.currentTarget.attributes.data.value);
    }
});
