
// function distributorLogin(event) {
//     event.preventDefault();

//     const spinItem = document.querySelector('.spin2')
//     spinItem.style.display = "inline-block";

//     // const getPageModal = document.querySelector(".pagemodal");
//     // getPageModal.style.display = "block";

//     const getEmail = document.getElementById('email').value;
//     const getPass = document.getElementById('password').value;
    

    
//     if (getEmail === '' || getPass === '') {
//     Swal.fire({
//       icon: 'info',
//       text: 'All fields are required!',
//       confirmButtonColor: "#2D85DE"
//     })
//     spinItem.style.display = "none";
//     return;
//     }

//     else {
//         // convert to raw data
//         const signData = {
//             email: getEmail,
//             password: getPass
//         }

//         const signMethod = {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(signData)
//         }

//         const url = 'http://localhost:3001/amazon/document/api/login';
//         // callimg the api
//         fetch(url, signMethod)
//         .then(response => response.json())
//         .then(result => {
//             console.log(result)
           
//            console.log(result)
//             if (result.success || result.token ) {
//                 localStorage.setItem("key", result.token)
//                 localStorage.setItem("customerloginid", result._id)
//                 const currentId = localStorage.getItem('customerloginid')
//                 const previousId = localStorage.getItem('customerid')

//                 const tokenParts = result.token.split(".");
//                 const payload = JSON.parse(atob(tokenParts[1]));

//                 if (!payload.isDistributor) {
//                 Swal.fire({
//                     icon: 'error',
//                     text: `Only distributors are allowed to login here.`,
//                     confirmButtonColor: "#2D85DE"
//                 });
//                 spinItem.style.display = "none";
//                 return;
//                 }

//                 // Save distributor session
//                 localStorage.setItem("key", result.token);
//                 localStorage.setItem("customerloginid", result._id);


//                 if( previousId !== currentId) {
//                     Swal.fire({
//                     icon: 'info',
//                     text: `Youre Logging In With a Different Account`,
//                     confirmButtonColor: "#2D85DE"
//                 })
//                 setTimeout(() => {
                    
//                 }, 1000)
//                 }

//                 Swal.fire({
//                     icon: 'success',
//                     text: `Login Sucessful`,
//                     confirmButtonColor: "#2D85DE"
//                 })
//                 setTimeout(() => {
//                     location.href = "./index.html";
//                     // getPageModal.style.display = "none";

//                 }, 3000)
//                 localStorage.setItem("customerid", currentId );
//             }
            
//             else {
//                 Swal.fire({
//                     icon: 'info',
//                     text: result.message || 'Registration Failed',
//                     confirmButtonColor: "#2D85DE"
//                 })
//                 spinItem.style.display = "none";
//             }
//         })
//         .catch(error => {
//             console.log('error', error)
//             Swal.fire({
//                 icon: 'info',
//                 text: `Something Went wrong, Try Again`,
//                 confirmButtonColor: "#2D85DE"
//             })
//             spinItem.style.display = "none";
//         });
//     }

// }

function distributorLogin(event) {
    event.preventDefault();

    const spinItem = document.querySelector('.spin2');
    spinItem.style.display = "inline-block";

    const getEmail = document.getElementById('email').value;
    const getPass = document.getElementById('password').value;

    if (getEmail === '' || getPass === '') {
        Swal.fire({
            icon: 'info',
            text: 'All fields are required!',
            confirmButtonColor: "#2D85DE"
        });
        spinItem.style.display = "none";
        return;
    }

    const signData = { email: getEmail, password: getPass };

    const signMethod = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signData)
    };

    // ✅ Corrected URL
    const url = 'http://localhost:3001/amazon/document/api/login';

    fetch(url, signMethod)
        .then(response => response.json())
        .then(result => {
            console.log("Login result:", result);

            if (result.success && result.token) {
                // decode token
                const tokenParts = result.token.split(".");
                const payload = JSON.parse(atob(tokenParts[1]));

                // ✅ ensure user is distributor
                if (!payload.isDistributor) {
                    Swal.fire({
                        icon: 'error',
                        text: `Only distributors are allowed to login here.`,
                        confirmButtonColor: "#2D85DE"
                    });
                    spinItem.style.display = "none";
                    return;
                }

                // ✅ save token + ids in localStorage
                localStorage.setItem("key", result.token);
                localStorage.setItem("customerloginid", result._id);

                const currentId = localStorage.getItem('customerloginid');
                const previousId = localStorage.getItem('customerid');

                if (previousId && previousId !== currentId) {
                    Swal.fire({
                        icon: 'info',
                        text: `You’re logging in with a different account`,
                        confirmButtonColor: "#2D85DE"
                    });
                }

                Swal.fire({
                    icon: 'success',
                    text: `Login Successful`,
                    confirmButtonColor: "#2D85DE"
                });

                // ✅ save permanent customer id
                localStorage.setItem("customerid", currentId);

                // ✅ redirect after short delay
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);

            } else {
                Swal.fire({
                    icon: 'info',
                    text: result.message || 'Login Failed',
                    confirmButtonColor: "#2D85DE"
                });
                spinItem.style.display = "none";
            }
        })
        .catch(error => {
            console.log('error', error);
            Swal.fire({
                icon: 'error',
                text: `Something went wrong, try again`,
                confirmButtonColor: "#2D85DE"
            });
            spinItem.style.display = "none";
        });
}



function toggleNotification(event) {
    event.preventDefault();
    const notificationPopUp = document.getElementById('notificationPopUp');
    // notificationPopUp.style.display = "block";

    if (notificationPopUp.style.display === 'none' || notificationPopUp.style.display === '') {
        notificationPopUp.style.display = 'block';
    } else {
        notificationPopUp.style.display = 'none';
    }
}

function AllorderTable(event) {
    event.preventDefault();
    document.getElementById('AllorderTable').style.display = 'block';
    document.getElementById('PendingorderTable').style.display = 'none';
    document.getElementById('deliveredgorderTable').style.display = 'none';
    document.getElementById('cancelorderTable').style.display = 'none';

}

function PendingorderTable(event) {
    event.preventDefault();
    document.getElementById('PendingorderTable').style.display = 'block';
    document.getElementById('AllorderTable').style.display = 'none';
    document.getElementById('deliveredgorderTable').style.display = 'none';
    document.getElementById('cancelorderTable').style.display = 'none';

}

function deliveredgorderTable(event) {
    event.preventDefault();
    document.getElementById('deliveredgorderTable').style.display = 'block';
    document.getElementById('PendingorderTable').style.display = 'none';
    document.getElementById('AllorderTable').style.display = 'none';
    document.getElementById('cancelorderTable').style.display = 'none';

}

function cancelorderTable(event) {
    event.preventDefault();
    document.getElementById('cancelorderTable').style.display = 'block';
    document.getElementById('deliveredgorderTable').style.display = 'none';
    document.getElementById('PendingorderTable').style.display = 'none';
    document.getElementById('AllorderTable').style.display = 'none';
}