(function(){
    let idToken = null;
    const chatDiv = document.getElementById('chat');

    function addMessage(text, cls) {
        const p = document.createElement('p');
        p.className = cls;
        p.textContent = text;
        chatDiv.appendChild(p);
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    document.getElementById('login').addEventListener('click', function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password
        });

        const userPool = new AmazonCognitoIdentity.CognitoUserPool({
            UserPoolId: config.userPoolId,
            ClientId: config.userPoolClientId
        });

        const user = new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: userPool
        });

        user.authenticateUser(authDetails, {
            onSuccess: function(result) {
                idToken = result.getIdToken().getJwtToken();
                document.getElementById('auth').style.display = 'none';
                document.getElementById('chatContainer').style.display = 'block';
            },
            onFailure: function(err) {
                alert(err.message || JSON.stringify(err));
            }
        });
    });

    document.getElementById('send').addEventListener('click', function() {
        const msg = document.getElementById('message').value;
        if (!msg) return;
        addMessage(msg, 'user');
        document.getElementById('message').value = '';

        fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': idToken
            },
            body: JSON.stringify({ prompt: msg })
        })
        .then(r => r.json())
        .then(data => {
            const url = data.url ? data.url : (data.path ? config.cloudfrontUrl + '/' + data.path : '');
            if (url) {
                addMessage('Generated page: ' + url, 'bot');
                window.open(url, '_blank');
            } else {
                addMessage('No URL returned', 'bot');
            }
        })
        .catch(err => addMessage('Error: ' + err, 'bot'));
    });
})();
