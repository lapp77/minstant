Chats = new Mongo.Collection("chats");

Meteor.methods({
   addChat: function(otherUserId) {
       // only allowed logged-in users
       if (this.userId) {
           var filter = {
               $or: [
                   { user1Id: this.userId, user2Id: otherUserId },
                   { user2Id: this.userId, user1Id: otherUserId }
               ]
           };

           var chat = Chats.findOne(filter), chatId;

           if (!chat) {// no chat matching the filter - need to insert a new one
               chatId = Chats.insert({user1Id: this.userId, user2Id: otherUserId});
           }
           else {// there is a chat going already - use that.
               chatId = chat._id;
           }

           return chatId;
       }
       else {
           throw new Meteor.Error("not-loggedin", "User is not logged in.");
       }
   },
   addChatMessage: function(chatId, message) {
       // see if we can find a chat object in the database
       // to which we'll add the message
       var chat = Chats.findOne({_id: chatId});

       if (chat && this.userId) {// ok - we have a chat to use
           var msgs = chat.messages; // pull the messages property

           if (!msgs) {// no messages yet, create a new array
               msgs = [];
           }

           msgs.push({text: message, userId: this.userId});

           // put the messages array onto the chat object
           chat.messages = msgs;

           // update the chat object in the database.
           Chats.update(chat._id, chat);
       }
   }
});