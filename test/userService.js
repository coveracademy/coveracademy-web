var userService    = require('../apis/userService'),
    messages       = require('../apis/internal/messages'),
    logger         = require('../configs/logger'),
    models         = require('../models'),
    datasets       = require('./datasets'),
    userFixtures   = require('./datasets/userService'),
    Promise        = require('bluebird'),
    moment         = require('moment'),
    assert         = require('chai').assert,
    Bookshelf      = models.Bookshelf;

describe('userService', function() {
  beforeEach(function() {
    return datasets.clean();
  });

  describe('#create', function() {
    it('should create an user', function() {
      return userService.create({name: 'Sandro Simas', email: 'sandro@email.com', facebook_account: '31312312423'}).then(function(user) {
        assert.strictEqual(user.get('name'), 'Sandro Simas');
        assert.strictEqual(user.get('email'), 'sandro@email.com');
        assert.strictEqual(user.get('facebook_account'), '31312312423');
        assert.strictEqual(user.get('profile_picture'), 'facebook');
        assert.strictEqual(user.get('verified'), 1);
        return Promise.all([user, models.SocialAccount.collection().fetch()]);
      }).spread(function(user, socialAccounts) {
        assert.strictEqual(socialAccounts.size(), 1);
        var socialAccount = socialAccounts.at(0);
        assert.strictEqual(socialAccount.id, 1);
        assert.strictEqual(socialAccount.get('user_id'), user.id);
        assert.strictEqual(socialAccount.get('network'), 'facebook');
        assert.strictEqual(socialAccount.get('show_link'), 0);
        assert.isNull(socialAccount.get('url'), user.id);
      });
    });

    it('should set verified field to zero when verifyEmail flag is true', function() {
      return userService.create({name: 'Sandro Simas', email: 'sandro@email.com', facebook_account: '31312312423', verifyEmail: true}).then(function(user) {
        return user.fetch();
      }).then(function(user) {
        assert.strictEqual(user.get('verified'), 0);
      });        
    });

    it('should not create an user when email are not provided', function() {
      return userService.create({name: 'Sandro Simas', facebook_account: '31312312423'}).then(function(user) {
        throw new Error('It should not create an user when email are not provided');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.new.email.required');
      });
    });

    it('should not create an user when username is invalid', function() {
      return userService.create({name: 'Sandro Simas', username: 'sandro|simas', email: 'sandro@email.com', facebook_account: '31312312423'}).then(function(user) {
        throw new Error('It should not create an user when username is invalid');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.new.username.invalid');
      });
    });
  });

  describe('#update', function() {
    it('should update the user information and change to not verified since change its email', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});
        var edited = models.User.forge({id: 1, name: 'vesGuIM', email: 'sandro.csimas@gmail.com', username: 'sandro.csimas', gender: 'male', biography: 'Cover Academy founder!', city: 'Salvador', state: 'Bahia', profile_picture: 'facebook', verified: 1, twitter_account: 'my_twitter_account'});
        return userService.update(user, edited);
      }).then(function(edited) {
        return models.User.forge({id: edited.id}).fetch();
      }).then(function(edited) {
        assert.strictEqual(edited.get('name'), 'vesGuIM');
        assert.strictEqual(edited.get('email'), 'sandro.csimas@gmail.com');
        assert.strictEqual(edited.get('gender'), 'male');
        assert.strictEqual(edited.get('biography'), 'Cover Academy founder!');
        assert.strictEqual(edited.get('city'), 'Salvador');
        assert.strictEqual(edited.get('state'), 'Bahia');
        assert.strictEqual(edited.get('profile_picture'), 'facebook');
        assert.strictEqual(edited.get('verified'), 0);
        assert.isNull(edited.get('twitter_account'));
      });
    });

    it('should update another user when user has admin permission', function() {
      return datasets.load(userFixtures.twoUsersAndOneAdmin).then(function() {
        var user = models.User.forge({id: 1});
        var edited = models.User.forge({id: 2, email: 'pedroforbrig@gmail.com'});
        return userService.update(user, edited);
      }).then(function(edited) {
        return models.User.forge({id: edited.id}).fetch();
      }).then(function(edited) {
        assert.strictEqual(edited.get('email'), 'pedroforbrig@gmail.com');
      });
    });

    it('should not update an user when is not the same user editing', function() {
      return datasets.load(userFixtures.twoUsersAndOneAdmin).then(function() {
        var user = models.User.forge({id: 2});
        var edited = models.User.forge({id: 3, name: 'Leirson'});
        return userService.update(user, edited);
      }).then(function(user) {
        throw new Error('It should not update an user when is not the same user editing');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.update.noPermission');
      });
    });

    it('should not update the user when he tries to change username more then once', function() {
      var user = models.User.forge({id: 1});
      var edited = models.User.forge({id: 1, username: 'sandro.csimas'});
      return datasets.load(userFixtures.oneUser).then(function() {
        return userService.update(user, edited);
      }).then(function(edited) {
        edited.set('username', 'sandrocsimas');
        return userService.update(user, edited);
      }).then(function(edited) {
        throw new Error('It should not update the user when he tries to change email more then once');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.update.username.cannotEditAnymore');
      });
    });

    it('should not update an user when username is invalid', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});
        var edited = models.User.forge({id: 1, username: 'sandro|csimas'});
        return userService.update(user, edited);
      }).then(function(user) {
        throw new Error('It should not update an user when username is invalid');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.update.username.invalid');
      });
    });

    it('should not update an user when attribute is not elegible for update', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});
        var edited = models.User.forge({id: 1, twitter_account: 'my_twitter_account'});
        return userService.update(user, edited);
      }).then(function() {
        throw new Error('It should not update an user when attribute is not elegible for update');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.update.nothingToSave');
      });
    });

    it('should not update an unexistent user', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});
        var edited = models.User.forge({id: 4000, name: 'vesGuIM'});
        return userService.update(user, edited);
      }).then(function() {
        throw new Error('It should not update an unexistent user');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.update.userNotFound');
      });
    });

    it('should not update an user with an unexistent user', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 4000});
        var edited = models.User.forge({id: 1, name: 'vesGuIM'});
        return userService.update(user, edited);
      }).then(function() {
        throw new Error('It should not update an user with an unexistent user');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.update.userNotFound');
      });
    });
  });

  describe('#connectNetwork', function() {
    it('should connect with twitter account', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.connectNetwork(user, 'twitter', '259214308', 'https://pbs.twimg.com/profile_images/535969471265927168/G5wz_LgV.jpeg', 'sandrocsimas');
      }).then(function(user) {
        return user.fetch({withRelated: ['socialAccounts']});
      }).then(function(user) {
        assert.strictEqual(user.get('twitter_account'), '259214308');
        assert.strictEqual(user.get('twitter_picture'), 'https://pbs.twimg.com/profile_images/535969471265927168/G5wz_LgV.jpeg');
        var socialAccounts = user.related('socialAccounts');
        var twitterAccount = socialAccounts.at(1);
        assert.strictEqual(twitterAccount.get('user_id'), 1);
        assert.strictEqual(twitterAccount.get('network'), 'twitter');
        assert.strictEqual(twitterAccount.get('url'), 'sandrocsimas');
        assert.strictEqual(twitterAccount.get('show_link'), 0);
      });
    });

    it('should connect with google account', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.connectNetwork(user, 'google', '110366065118342779578', 'https://lh3.googleusercontent.com/-TAFHnODv8Cw/AAAAAAAAAAI/AAAAAAAAArA/-pg0mR1ruIk/photo.jpg');
      }).then(function(user) {
        return user.fetch({withRelated: ['socialAccounts']});
      }).then(function(user) {
        assert.strictEqual(user.get('google_account'), '110366065118342779578');
        assert.strictEqual(user.get('google_picture'), 'https://lh3.googleusercontent.com/-TAFHnODv8Cw/AAAAAAAAAAI/AAAAAAAAArA/-pg0mR1ruIk/photo.jpg');
        var socialAccounts = user.related('socialAccounts');
        var googleAccount = socialAccounts.at(1);
        assert.strictEqual(googleAccount.get('user_id'), 1);
        assert.strictEqual(googleAccount.get('network'), 'google');
        assert.isNull(googleAccount.get('url'));
        assert.strictEqual(googleAccount.get('show_link'), 0);
      });
    });

    it('should connect with youtube account', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.connectNetwork(user, 'youtube', 'UC3a55JatyJ6T2j8oQQ0kWhw');
      }).then(function(user) {
        return user.fetch({withRelated: ['socialAccounts']});
      }).then(function(user) {
        assert.strictEqual(user.get('youtube_account'), 'UC3a55JatyJ6T2j8oQQ0kWhw');
        var socialAccounts = user.related('socialAccounts');
        var youtubeAccount = socialAccounts.at(1);
        assert.strictEqual(youtubeAccount.get('user_id'), 1);
        assert.strictEqual(youtubeAccount.get('network'), 'youtube');
        assert.isNull(youtubeAccount.get('url'));
        assert.strictEqual(youtubeAccount.get('show_link'), 0);
      });
    });

    it('should connect with soundcloud account', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.connectNetwork(user, 'soundcloud', '7959294', null, 'sandro-csimas');
      }).then(function(user) {
        return user.fetch({withRelated: ['socialAccounts']});
      }).then(function(user) {
        assert.strictEqual(user.get('soundcloud_account'), '7959294');
        var socialAccounts = user.related('socialAccounts');
        var soundcloudAccount = socialAccounts.at(1);
        assert.strictEqual(soundcloudAccount.get('user_id'), 1);
        assert.strictEqual(soundcloudAccount.get('network'), 'soundcloud');
        assert.strictEqual(soundcloudAccount.get('url'), 'sandro-csimas');
        assert.strictEqual(soundcloudAccount.get('show_link'), 0);
      });
    });

    it('should not connect with unknown networks', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.connectNetwork(user, 'twoo', '88462312', null, 'sandro-csimas');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.connectNetwork.unsupportedNetwork');
      });
    });
  });

  describe('#disconnectNetwork', function() {
    it('should disconnect from twitter account', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.disconnectNetwork(user, 'twitter');
      }).then(function(user) {
        return user.fetch({withRelated: ['socialAccounts']});
      }).then(function(user) {       
        assert.isNull(user.get('twitter_account'));
        assert.isNull(user.get('twitter_picture'));
        var socialAccounts = user.related('socialAccounts');
        socialAccounts.forEach(function(socialAccount) {
          assert.notStrictEqual(socialAccount.get('network'), 'twitter');
        });         
      });
    });

    it('should connect from google account', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.disconnectNetwork(user, 'google');
      }).then(function(user) {
        return user.fetch({withRelated: ['socialAccounts']});
      }).then(function(user) {                
        assert.isNull(user.get('google_account'));
        assert.isNull(user.get('google_picture'));
        var socialAccounts = user.related('socialAccounts');
        socialAccounts.forEach(function(socialAccount) {
          assert.notStrictEqual(socialAccount.get('network'), 'google');
        });
      });
    });

    it('should connect from youtube account', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.disconnectNetwork(user, 'youtube');
      }).then(function(user) {
        return user.fetch({withRelated: ['socialAccounts']});
      }).then(function(user) {        
        var socialAccounts = user.related('socialAccounts');
        socialAccounts.forEach(function(socialAccount) {
          assert.notStrictEqual(socialAccount.get('network'), 'youtube');
        });
      });
    });

    it('should connect from soundcloud account', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.disconnectNetwork(user, 'soundcloud');
      }).then(function(user) {
        return user.fetch({withRelated: ['socialAccounts']});
      }).then(function(user) {        
        var socialAccounts = user.related('socialAccounts');
        socialAccounts.forEach(function(socialAccount) {
          assert.notStrictEqual(socialAccount.get('network'), 'soundcloud');
        });
      });
    });

    it('should not disconnect from unknown networks', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.disconnectNetwork(user, 'twoo');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.disconnectNetwork.unsupportedNetwork');
      });
    });

    it('should not disconnect from facebook', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});  
        return userService.disconnectNetwork(user, 'facebook');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.disconnectNetwork.unsupportedNetwork');
      });
    });
  });


  // describe('#authenticate', function() {
  //   it('should authenticate user', function() {
  //     return datasets.load(require('./datasets/userService').authenticate).then(function() {
  //       return userService.authenticate('sandro@email.com', '123456');
  //     }).then(function(user) {
  //       assert.strictEqual(user.get('first_name'), 'Sandro');
  //       assert.strictEqual(user.get('last_name'), 'Simas');
  //       assert.strictEqual(user.get('phone'), '+55 71 9999-9999');
  //       assert.strictEqual(user.get('email'), 'sandro@email.com');
  //       assert.strictEqual(user.get('password'), '$2a$10$e7kTlnUSZAXsNlwKOans3.3CEdFgZkkPB8uChMe3iWK1lYusWbwtq');
  //     });
  //   });

  //   it('should not authenticate user when email does not exists', function() {
  //     return datasets.load(require('./datasets/userService').authenticate).then(function() {
  //       return userService.authenticate('sandrooooooooooo@email.com', '123456');
  //     }).then(function(user) {
  //       throw new Error('It should not authenticate user when email does not exists');
  //     }).catch(messages.APIError, function(err) {
  //       assert.strictEqual(err.errorKey, 'user.auth.emailNotFound');
  //     });
  //   });
  // });

  // describe('#findById', function() {
  //   it('should load an user by id without relateds', function() {
  //     return datasets.load(circleFixtures.circleWithOneUser).then(function() {
  //       return userService.findById(1);
  //     }).then(function(user) {
  //       assert.strictEqual(user.get('first_name'), 'Sandro');
  //       assert.strictEqual(user.get('last_name'), 'Simas');
  //       assert.strictEqual(user.get('phone'), '+55 71 9999-9999');
  //       assert.strictEqual(user.get('email'), 'sandro@email.com');
  //       assert.strictEqual(user.get('password'), '$2a$10$e7kTlnUSZAXsNlwKOans3.3CEdFgZkkPB8uChMe3iWK1lYusWbwtq');
  //       assert.strictEqual(user.get('verified'), 0);
  //       assert.strictEqual(user.related('circlesAssociation').length, 0);
  //       assert.strictEqual(user.related('circles').length, 0);
  //     });
  //   });

  //   it('should load an user by id with circles and circlesAssociation', function() {
  //     return datasets.load(circleFixtures.circleWithOneUser).then(function() {
  //       return userService.findById(1, ['circles', 'circlesAssociation']);
  //     }).then(function(user){
  //       var circles = user.related('circles');
  //       assert.strictEqual(circles.length, 1);
  //       var circle = circles.at(0);
  //       assert.strictEqual(circle.get('creator_id'), user.id);
  //       assert.strictEqual(circle.get('location_mode'), 'anytime');
  //       var circlesAssociation = user.related('circlesAssociation');
  //       assert.strictEqual(circlesAssociation.length, 1);
  //       var circleAssociation = circlesAssociation.at(0);
  //       assert.strictEqual(circleAssociation.get('circle_id'), circle.id);
  //       assert.strictEqual(circleAssociation.get('user_id'), user.id);
  //     });
  //   });
  // });


  // describe('#searchAssociatedUsers', function() {
  //   it('should return all users associated', function() {
  //     return datasets.load(userFixtures.fourUsersAndAssociations).bind({}).then(function() {
  //       return userService.searchAssociatedUsers(models.User.forge({id: 1}), null, 1, 2);
  //     }).then(function(users) {
  //       assert.isNotNull(users);
  //       assert.strictEqual(users.length, 2);
  //       assert.strictEqual(users.at(0).id, 3);
  //       assert.strictEqual(users.at(0).get('first_name'), 'Maria');
  //       assert.strictEqual(users.at(1).id, 2);
  //       assert.strictEqual(users.at(1).get('first_name'), 'Wesley');
  //     });
  //   });

  //   it('should return all users associated that contains \'Mas\'', function() {
  //     return datasets.load(userFixtures.fourUsersAndAssociations).bind({}).then(function() {
  //       return userService.searchAssociatedUsers(models.User.forge({id: 1}), 'Mas', 1, 2);
  //     }).then(function(users) {
  //       assert.isNotNull(users);
  //       assert.strictEqual(users.length, 1);
  //       assert.strictEqual(users.at(0).id, 2);
  //     });
  //   });
  // });

  // describe('#associateUsers', function() {
  //   it('should update registration_date when association already exists', function() {
  //     return datasets.load(userFixtures.fourUsersAndAssociations).then(function() {
  //       var user = models.User.forge({id: 1});
  //       var relatedUser = models.User.forge({id: 2});
  //       return userService.associateUsers(user, relatedUser);
  //     }).then(function() {
  //       var firstAssociation = models.UserAssociation.forge({user_id: 1, related_id: 2});
  //       var secondAssociation = models.UserAssociation.forge({user_id: 2, related_id: 1});
  //       return Promise.all([firstAssociation.fetch(), secondAssociation.fetch()]);
  //     }).spread(function(firstAssociation, secondAssociation) {
  //       var date = new Date(2015, 3, 9, 10, 12, 20, 0);
  //       assert.isAbove(firstAssociation.get('registration_date').getTime(), date.getTime());
  //       assert.isAbove(secondAssociation.get('registration_date').getTime(), date.getTime());
  //     });
  //   });

  //   it('should associate users successfully', function() {
  //     return datasets.load(userFixtures.fourUsersAndAssociations).then(function() {
  //       var user = models.User.forge({id: 1});
  //       var relatedUser = models.User.forge({id: 4});
  //       return userService.associateUsers(user, relatedUser);
  //     }).then(function() {
  //       var firstAssociation = models.UserAssociation.forge({user_id: 1, related_id: 4});
  //       var secondAssociation = models.UserAssociation.forge({user_id: 4, related_id: 1});
  //       return Promise.all([firstAssociation.fetch(), secondAssociation.fetch()]);
  //     }).spread(function(firstAssociation, secondAssociation) {
  //       assert.isNotNull(firstAssociation);
  //       assert.isNotNull(secondAssociation);
  //     });
  //   });

  //   it('should not associate an unexistent user', function() {
  //     return datasets.load(userFixtures.fourUsersAndAssociations).then(function() {
  //       var user = models.User.forge({id: 1});
  //       var relatedUser = models.User.forge({id: 4000});
  //       return userService.associateUsers(user, relatedUser);
  //     }).then(function() {
  //       throw new Error('It is not correct associate an unexistent user');
  //     }).catch(messages.APIError, function(err) {
  //       assert.strictEqual(err.statusCode, 400);
  //       assert.strictEqual(err.cause.code, 'ER_NO_REFERENCED_ROW_');
  //       assert.strictEqual(err.errorKey, 'user.association.errorAssociating');
  //     });
  //   });
  // });
});