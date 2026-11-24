function subscribe(event){
  event.preventDefault();
  const email = event.target.querySelector("input").value;
  alert("Thanks! " + email + " has been added to the list. Connect this form to your email service before publishing.");
  event.target.reset();
}