var userService    = require('../apis/userService'),
    messages       = require('../apis/internal/messages'),
    logger         = require('../configs/logger'),
    models         = require('../models'),
    datasets       = require('./datasets'),
    userFixtures   = require('./datasets/userService'),
    Promise        = require('bluebird'),
    moment         = require('moment'),
    nock           = require('nock'),
    assert         = require('chai').assert,
    Bookshelf      = models.Bookshelf;

var postmanUrl = 'http://localhost:5000';

describe('userService', function() {
  beforeEach(function() {
    return datasets.clean();
  });

  describe('#create', function() {
    it('should create an user', function() {
      return userService.create('31312312423', 'Sandro Simas', 'sandro@email.com', 'male').then(function(user) {
        assert.strictEqual(user.get('facebook_account'), '31312312423');
        assert.strictEqual(user.get('name'), 'Sandro Simas');
        assert.strictEqual(user.get('email'), 'sandro@email.com');
        assert.strictEqual(user.get('gender'), 'male');
        assert.strictEqual(user.get('profile_picture'), 'facebook');
        assert.strictEqual(user.get('permission'), 'user');
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

    it('should set verified to false when email are not provided', function() {
      return userService.create('31312312424', 'Maday Avila', null, 'famale').then(function(user) {
        return models.User.forge({id: user.id}).fetch();
      }).then(function(user) {
        assert.strictEqual(user.get('verified'), 0);
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
        assert.strictEqual(err.key, 'user.update.noPermission');
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
        assert.strictEqual(err.key, 'user.update.username.cannotEditAnymore');
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
        assert.strictEqual(err.key, 'user.update.username.invalid');
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
        assert.strictEqual(err.key, 'user.update.nothingToSave');
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
        assert.strictEqual(err.key, 'user.notFound');
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
        assert.strictEqual(err.key, 'user.notFound');
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
        assert.strictEqual(err.key, 'user.connectNetwork.unsupportedNetwork');
      });
    });
  });

  describe('#disconnectNetwork', function() {
    it('should disconnect from twitter account', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
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
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
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
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
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
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
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
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        var user = models.User.forge({id: 1});
        return userService.disconnectNetwork(user, 'twoo');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.key, 'user.disconnectNetwork.unsupportedNetwork');
      });
    });

    it('should not disconnect from facebook', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        var user = models.User.forge({id: 1});
        return userService.disconnectNetwork(user, 'facebook');
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.key, 'user.disconnectNetwork.unsupportedNetwork');
      });
    });
  });

  describe('#showNetwork', function() {
    it('should change flag to show or not facebook network link', function() {
      var user = models.User.forge({id: 1});
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.showNetwork(user, 'facebook', true);
      }).then(function(socialAccount) {
        return socialAccount.fetch();
      }).then(function(socialAccount) {
        assert.strictEqual(socialAccount.get('network'), 'facebook');
        assert.strictEqual(socialAccount.get('show_link'), 1);
        return userService.showNetwork(user, 'facebook', false);
      }).then(function(socialAccount) {
        return socialAccount.fetch();
      }).then(function(socialAccount) {
        assert.strictEqual(socialAccount.get('network'), 'facebook');
        assert.strictEqual(socialAccount.get('show_link'), 0);
      });
    });

    it('should fail when tries to show user link of a non connected network', function() {
      var user = models.User.forge({id: 1});
      return datasets.load(userFixtures.oneUser).then(function() {
        return userService.showNetwork(user, 'twitter', true);
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.key, 'user.showNetwork.userNotConnected');
      });
    });

    it('should fail when tries to show user link of an unsupported network', function() {
      var user = models.User.forge({id: 1});
      return datasets.load(userFixtures.oneUser).then(function() {
        return userService.showNetwork(user, 'twoo', true);
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.key, 'user.showNetwork.unsupportedNetwork');
      });
    });
  });

  describe('#findById', function() {
    it('should find user by id', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findById(1);
      }).then(function(user) {
        assert.strictEqual(user.id, 1);
        assert.deepEqual(user.relations, {});
      });
    });

    it('should find user by id and load socialAccounts', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findById(1, true);
      }).then(function(user) {
        assert.strictEqual(user.id, 1);
        assert.deepEqual(user.related('socialAccounts').size(), 5);
      });
    });

    it('should fail when user was not found', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findById(3);
      }).catch(messages.NotFoundError, function(err) {
        assert.strictEqual(err.key, 'user.notFound');
      });
    });
  });

  describe('#findByEmail', function() {
    it('should find user by email', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findByEmail('sandro@email.com');
      }).then(function(user) {
        assert.strictEqual(user.get('email'), 'sandro@email.com');
        assert.deepEqual(user.relations, {});
      });
    });

    it('should find user by email and load socialAccounts', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findByEmail('sandro@email.com', true);
      }).then(function(user) {
        assert.strictEqual(user.get('email'), 'sandro@email.com');
        assert.deepEqual(user.related('socialAccounts').size(), 5);
      });
    });

    it('should fail when user was not found', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findByEmail('sandro.csimas@email.com');
      }).catch(messages.NotFoundError, function(err) {
        assert.strictEqual(err.key, 'user.notFound');
      });
    });
  });

  describe('#findByUsername', function() {
    it('should find user by username', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findByUsername('sandro.csimas');
      }).then(function(user) {
        assert.strictEqual(user.get('username'), 'sandro.csimas');
        assert.deepEqual(user.relations, {});
      });
    });

    it('should find user by username and load socialAccounts', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findByUsername('sandro.csimas', true);
      }).then(function(user) {
        assert.strictEqual(user.get('username'), 'sandro.csimas');
        assert.deepEqual(user.related('socialAccounts').size(), 5);
      });
    });

    it('should fail when user was not found', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findByUsername('sandro-csimas');
      }).catch(messages.NotFoundError, function(err) {
        assert.strictEqual(err.key, 'user.notFound');
      });
    });
  });

  describe('#findBySocialAccount', function() {
    it('should find user by social account', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findBySocialAccount('twitter', '259214308');
      }).then(function(user) {
        assert.strictEqual(user.get('twitter_account'), '259214308');
        assert.deepEqual(user.relations, {});
      });
    });

    it('should find user by social account and load socialAccounts', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findBySocialAccount('twitter', '259214308', true);
      }).then(function(user) {
        assert.strictEqual(user.get('twitter_account'), '259214308');
        assert.deepEqual(user.related('socialAccounts').size(), 5);
      });
    });

    it('should fail when user was not found', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.findBySocialAccount('twitter', '25921450000000', true);
      }).catch(messages.NotFoundError, function(err) {
        assert.strictEqual(err.key, 'user.notFound');
      });
    });
  });

  describe('#verifyEmail', function() {
    it('should set verified to true', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        return userService.verifyEmail('27e77df78e9459c4a918ca3a40961ba3');
      }).then(function(user) {
        assert.strictEqual(user.get('verified'), 1);
      });
    });

    it('should fail when user was not found', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.verifyEmail('27e77df78e9459e12h31nk3j12');
      }).catch(messages.NotFoundError, function(err) {
        assert.strictEqual(err.key, 'user.notFound');
      });
    });
  });

  describe('#resendVerificationEmail', function() {
    it('should resend verification email when user is not verified', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 1});
        nock(postmanUrl).post('/user/verification', {user: 1, registration: false}).reply(200);
        return userService.resendVerificationEmail(user);
      });
    });

    it('should fail tries to resend verification email to an unexistent user', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        var user = models.User.forge({id: 2});
        return userService.resendVerificationEmail(user);
      }).catch(messages.NotFoundError, function(err) {
        assert.strictEqual(err.key, 'user.notFound');
      });
    });

    it('should fail tries to resend verification email to an already verified user', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        var user = models.User.forge({id: 1});
        return userService.resendVerificationEmail(user);
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.key, 'user.verification.emailAlreadyVerified');
      });
    });
  });

  describe('#disableEmails', function() {
    it('should set emails_enabled to false', function() {
      return datasets.load(userFixtures.oneUser).then(function() {
        return userService.disableEmails('27e77df78e9459c4a918ca3a40961ba3');
      }).then(function(user) {
        assert.strictEqual(user.get('emails_enabled'), 0);
      });
    });

    it('should fail when user was not found', function() {
      return datasets.load(userFixtures.oneUserConnectedToAllNetworks).then(function() {
        return userService.disableEmails('27e77df78e9459e12h31nk3j12');
      }).catch(messages.NotFoundError, function(err) {
        assert.strictEqual(err.key, 'user.notFound');
      });
    });
  });

  describe('#listUsers', function() {
    it('should return all users in database', function() {
      return datasets.load(userFixtures.twoUsersAndOneAdmin).then(function() {
        return userService.listUsers();
      }).then(function(users) {
        assert.strictEqual(users.size(), 3);
        assert.strictEqual(users.at(0).get('name'), 'Sandro Simas');
        assert.strictEqual(users.at(1).get('name'), 'Pedro Forbrig');
        assert.strictEqual(users.at(2).get('name'), 'Leirson Barreto');
      });
    });
  });

  describe('#fan', function() {
    it('should turn an user into a fan', function() {
      var now = moment().millisecond(0).toDate();
      return datasets.load(userFixtures.twoUsersAndOneAdmin).then(function() {
        var user = models.User.forge({id: 1});
        var fan = models.User.forge({id: 2});
        return userService.fan(fan, user);
      }).then(function(userFan) {
        return userFan.fetch();
        assert.strictEqual(userFan.get('user_id'), 1);
        assert.strictEqual(userFan.get('fan_id'), 2);
        assert.isTrue(userFan.get('registration_date').getTime() === now.getTime() || userFan.get('registration_date').getTime() > now.getTime());
      });
    });

    it('should ignore error when tries to fan the same user twice', function() {
      var now = moment().millisecond(0).toDate();
      var user = models.User.forge({id: 1});
      var fan = models.User.forge({id: 2});
      return datasets.load(userFixtures.twoUsersAndOneAdmin).then(function() {
        return userService.fan(fan, user);
      }).then(function(userFan) {
        return userService.fan(fan, user);
      }).then(function(userFan) {
        return userFan.fetch();
        assert.strictEqual(userFan.get('user_id'), 1);
        assert.strictEqual(userFan.get('fan_id'), 2);
        assert.isTrue(userFan.get('registration_date').getTime() === now.getTime() || userFan.get('registration_date').getTime() > now.getTime());
      });
    });

    it('should fail when tries to fan yourself', function() {
      var now = moment().millisecond(0).toDate();
      return datasets.load(userFixtures.twoUsersAndOneAdmin).then(function() {
        var user = models.User.forge({id: 1});
        var fan = models.User.forge({id: 1});
        return userService.fan(fan, user);
      }).catch(messages.APIError, function(err) {
        assert.strictEqual(err.key, 'user.fan.canNotFanYourself');
      });
    });
  });
});