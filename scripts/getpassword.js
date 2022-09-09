// the most important function! must NEVER change
function GetPassword(d,u,p,e,s)
{
	var k=p+"|"+d+"|"+u+"|"+e;
	for(;s>0;s--)k+="|"+p;
	var h=CryptoJS.SHA3(k,{outputLength: 256});
	var n = "";
	do
	{
		n = n+h.toString(CryptoJS.enc.Hex);
		for(var i=0; i< n.length;i++)
		{
		  if (n.charAt(i) < '0' || n.charAt(i) > '9')
		  {
		  	n = n.substr(0, i) + n.substr(i+1);
		  	i--;
		  }		  
		}
	}
	while(n.length < 6);
	var res =
	{
		base64:h.toString(CryptoJS.enc.Base64),
		hex:h.toString(CryptoJS.enc.Hex),
		num:n
	};
	return res;
}
function GetPasswordForm(f){
	return GetPassword(f.domain, f.user, f.password, f.secret, parseInt(f.revision));
}
// Another most important function! must NEVER change
function GetPasswordFormPolicy(len, f) {
    var state = CryptoJS.SHA3(f.revision,{outputLength: 256}).toString(CryptoJS.enc.Hex);
    var bytes = [];
    var index = 0;
    var result = '';
    var policy = [
        'ABCDEFGHJKLMNPQRSTUVWXYZ',
        'abcdefghijkmnopqrstuvwxyz',
        '123456789',
        '+=/_!@%^&*()-:;,?.~<>{}[]\\',
        'ABCDEFGHJKLMNPQRSTUVWXYZ'+'abcdefghijkmnopqrstuvwxyz'+'123456789'+'+=/_!@%^&*()-:;,?.~<>{}[]\\'
        ];
    while(result.length < len)
    {
        if (index >= bytes.length)
        {
            var k = f.domain + '\n' + f.user + '\n' + f.password + '\n' + f.secret + '\n' + state;
            
	        var h = CryptoJS.SHA3(k,{outputLength: 256});
	        state = h.toString(CryptoJS.enc.Base64);
	        for (var i = 0; i < h.words.length; i++)
	        {
	            var word = h.words[i];
	            bytes.push((word & 0x00FF) / 0x0001);
	            bytes.push((word & 0xFF00) / 0x0100);
	        }
        }
        var chars = policy[Math.min(result.length, 4)];
        if (bytes[index] > (255 - (256 % chars.length)))
        {
            index++;
            continue;
        }
        var char = chars[bytes[index] % chars.length];
        index++;
	    if (result.length >= 4 && char == result[result.length-1])
	    {
            continue;
	    }
	    result += char;
    }
    return result;
}