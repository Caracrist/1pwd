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
	return GetPassword(f.domain, f.user, f.password, f.secret, parseInt(f.seqnum));
}