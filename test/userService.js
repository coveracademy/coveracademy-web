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
      return userService.create({name: 'Sandro Simas', email: 'sandro@email.com', facebook_account: '31312312423', profile_picture: 'facebook'}).then(function(user) {
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

    it('should send verification email order when verifyEmail flag is setted to true', function() {
      return userService.create({name: 'Sandro Simas', email: 'sandro@email.com', facebook_account: '31312312423', profile_picture: 'facebook', verifyEmail: true}).then(function(user) {
        assert.strictEqual(user.get('verified'), 0);
        return Promise.delay(100);
      }).then(function() {
        return models.VerificationToken.collection().fetch();
      }).then(function(verificationTokens) {
        assert.strictEqual(verificationTokens.size(), 1);
        var verificationToken = verificationTokens.at(0);
        assert.isNotNull(verificationToken.get('token'));
        assert.strictEqual(verificationToken.get('user_id'), 1);
        var sevenDaysLater = moment().add(7, 'days');
        var expirationDate = moment(verificationToken.get('expiration_date'));
        assert.strictEqual(expirationDate.year(), sevenDaysLater.year());
        assert.strictEqual(expirationDate.month(), sevenDaysLater.month());
        assert.strictEqual(expirationDate.day(), sevenDaysLater.day());
        assert.strictEqual(expirationDate.hour(), sevenDaysLater.hour());
        assert.strictEqual(expirationDate.minute(), sevenDaysLater.minute());
      });
    });

    it('should not create an user when email are not provided', function() {
      return userService.create({name: 'Sandro Simas', facebook_account: '31312312423', profile_picture: 'facebook'}).then(function(user) {
        throw new Error('It should not create an user when email are not provided');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.new.emailRequired');
      });
    });

    it('should not create an user when username is invalid', function() {
      return userService.create({name: 'Sandro Simas', username: 'sandro|simas', email: 'sandro@email.com', facebook_account: '31312312423', profile_picture: 'facebook'}).then(function(user) {
        throw new Error('It should not create an user when username is invalid');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.errorKey, 'user.new.invalidUsername');
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

  // describe('#update', function() {
  //   it('should update the user last name', function() {
  //     var newLastname = 'Costa Simas';
  //     return datasets.load(userFixtures.oneUser).then(function() {
  //       return userService.update(models.User.forge({id: 1, last_name: newLastname}));
  //     }).then(function(user) {
  //       return models.User.forge({id: 1}).fetch();
  //     }).then(function(user) {
  //       assert.strictEqual(user.get('first_name'), 'Sandro');
  //       assert.strictEqual(user.get('last_name'), newLastname);
  //       assert.strictEqual(user.get('phone'), '+55 71 9999-9999');
  //       assert.strictEqual(user.get('email'), 'sandro@email.com');
  //     });
  //   });

  //   it('should not update an user when a required information is null', function() {
  //     return datasets.load(userFixtures.oneUser).then(function() {
  //       return userService.update(models.User.forge({id: 1, first_name: null, last_name: 'Costa Simas'}));
  //     }).then(function(user) {
  //       return models.User.forge({id: 1}).fetch();
  //     }).then(function(user) {
  //       throw new Error('It should not update an user when a required information is null');
  //     }).catch(messages.APIError, function(err) {
  //       assert.strictEqual(err.errorKey, 'user.update.first_name.invalid');
  //     });
  //   });

  //   it('should not update an user when attribute is not elegible', function() {
  //     return datasets.load(userFixtures.oneUser).then(function() {
  //       return userService.update(models.User.forge({id: 1, verified: 1}));
  //     }).then(function() {
  //       return models.User.forge({id: 1}).fetch();
  //     }).then(function(user) {
  //       throw new Error('It should not update an user when attribute is not elegible');
  //     }).catch(messages.APIError, function(err) {
  //       assert.strictEqual(err.errorKey, 'user.update.nothingToSave');
  //     });
  //   });

  //   it('should update the user first name from an unexistent user', function() {
  //     var newFirstname = 'Sandro';
  //     return userService.update(models.User.forge({id: 4000, last_name: newFirstname})).then(function() {
  //       throw new Error('It is not permited to update an unexistent user');
  //     }).catch(messages.APIError, function(err) {
  //       assert.strictEqual(err.errorKey, 'user.update.userNotFound');
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