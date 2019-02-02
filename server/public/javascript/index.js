document.querySelector('#wa_login_submit').addEventListener('click', function(e) {
    // if(document.querySelector('#wa_login_username').value.trim().length != 0 && document.querySelector('#wa_login_psd').value.trim().length != 0) {
    if(document.querySelector('#wa_login_username').value.trim() == 'admin' 
        && document.querySelector('#wa_login_psd').value.trim() == 'admin'
        || document.querySelector('#wa_login_username').value.trim() == 'user01' 
        && document.querySelector('#wa_login_psd').value.trim() == 'user01'
    ) {
        location.href = '/home.html';
        sessionStorage.setItem('islogin','true');
    } else {
        document.querySelector('#wa_login_alert').removeAttribute('class');
    }
});