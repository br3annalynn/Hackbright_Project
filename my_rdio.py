
import rdio
import os

CONSUMER_KEY = os.getenv('RDIO_CONSUMER_KEY')
CONSUMER_SECRET = os.getenv('RDIO_CONSUMER_SECRET')

rdio_manager = rdio.Api(CONSUMER_KEY, CONSUMER_SECRET)
user = rdio_manager.find_user('breannalynn@gmail.com')
print '%s %s\'s key is: %s.' % (user.first_name, user.last_name, user.key)

# Set authorization: get authorization URL, then pass back the PIN.
token_dict = rdio_manager.get_token_and_login_url()
print 'Authorize this application at: %s?oauth_token=%s' % (
    token_dict['login_url'], token_dict['oauth_token'])

print 'oauth_token: ', token_dict['oauth_token']
print 'oauth_token_secret: ', token_dict['oauth_token_secret']

token_secret = token_dict['oauth_token_secret']
oauth_verifier = raw_input('Enter the PIN / oAuth verifier: ').strip()
token = raw_input('Enter oauth_token parameter from URL: ').strip()
request_token = {"oauth_token":token, "oauth_token_secret":token_secret}
authorization_dict = rdio_manager.authorize_with_verifier(oauth_verifier, request_token)

# Get back key and secret. rdio_manager is now authorized
# on the user's behalf.
print 'Access token key: %s' % authorization_dict['oauth_token']
print 'Access token secret: %s' % authorization_dict['oauth_token_secret']

# Make an authorized call.
current_user = rdio_manager.current_user()
print 'The full name of the current user is %s.' % (
    current_user.name,)






