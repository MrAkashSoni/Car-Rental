Stripe.setPublishableKey('pk_test_foVqYU0PFIKrjh2l2jhygzPc00sX05TcUo');

var $form = $('#rentCar-form');

$form.submit(function (event) {
    $('#charge-error').addClass('hidden');
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#cardNumber').val(),
        cvc: $('#cvvNumber').val(),
        exp_month: $('#expiryMonth').val(),
        exp_year: $('#expiryYear').val(),
        name: $('#cardHolderName').val()
    }, stripeResponseHandler);
    return false;
});

function stripeResponseHandler(status, response) {
    if (response.error) { // Problem!
        // Show the errors on the form
        $('#charge-error').text(response.error.message);
        $('#charge-error').removeClass('hidden');
        $form.find('button').prop('disabled', false); // Re-enable submission
    } else { // Token was created!
        // Get the token ID:
        var token = response.id;
        // Insert the token into the form so it gets submitted to the server:
        $form.append($('<input type="hidden" name="stripeToken" />').val(token));
        console.log(token);
        // Submit the form:
        $form.get(0).submit();
    }
}