/**
 *
 *          ..::..
 *     ..::::::::::::..
 *   ::'''''':''::'''''::
 *   ::..  ..:  :  ....::
 *   ::::  :::  :  :   ::
 *   ::::  :::  :  ''' ::
 *   ::::..:::..::.....::
 *     ''::::::::::::''
 *          ''::''
 *
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Creative Commons License.
 * It is available through the world-wide-web at this URL:
 * http://creativecommons.org/licenses/by-nc-nd/3.0/nl/deed.en_US
 * If you are unable to obtain it through the world-wide-web, please send an email
 * to support@tig.nl so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade this module to newer
 * versions in the future. If you wish to customize this module for your
 * needs please contact support@tig.nl for more information.
 *
 * @copyright   Copyright (c) Total Internet Group B.V. https://tig.nl/copyright
 * @license     http://creativecommons.org/licenses/by-nc-nd/3.0/nl/deed.en_US
 */
define(
    [
        'jquery',
        'mage/url',
        'Magento_Checkout/js/model/resource-url-manager',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/action/create-billing-address',
        'Magento_Checkout/js/action/select-billing-address',
        'Magento_Checkout/js/action/select-payment-method',
        'Magento_Checkout/js/checkout-data'
    ],
    function (
        $,
        urlBuilder,
        resourceUrlManager,
        quote,
        createBillingAddress,
        selectBillingAddress,
        selectPaymentMethodAction,
        checkoutData
    ) {
        'use strict';

        return {
            setBillingAddress: function (address, email = null) {
                var addressData = this.getAddressData(address);

                if (email != null) {
                    addressData.email = email;
                }

                var newBillingAddress = createBillingAddress(addressData);
                selectBillingAddress(newBillingAddress);
                checkoutData.setSelectedBillingAddress(newBillingAddress.getKey());
                checkoutData.setNewCustomerBillingAddress($.extend(true, {}, addressData));
            },

            selectPaymentMethod: function (paymentMethodData) {
                selectPaymentMethodAction(paymentMethodData);
                checkoutData.setSelectedPaymentMethod('tig_buckaroo_applepay');

                return true;
            },

            savePaymentInfo: function () {
                var params = {};
                var payload = {};

                if (resourceUrlManager.getCheckoutMethod() == 'guest') {
                    params = {
                        cartId: quote.getQuoteId()
                    };
                    payload.email = quote.guestEmail;
                }

                var urls = {
                    'guest': '/guest-carts/:cartId/set-payment-information',
                    'customer': '/carts/mine/set-payment-information'
                };
                var url = resourceUrlManager.getUrl(urls, params);

                payload.paymentMethod = {
                    method: 'tig_buckaroo_applepay',
                    additional_data: {
                        buckaroo_skip_validation: true
                    }
                };
                payload.billingAddress = quote.billingAddress();
                payload.shippingAddress = quote.shippingAddress();

                $.ajax({
                    url: urlBuilder.build(url),
                    type: 'POST',
                    data: JSON.stringify(payload),
                    global: false,
                    contentType: 'application/json',
                    async: false
                }).done(function (result) {
                }.bind(this));
            },

            getAddressData: function (address) {
                var addressData = {
                    firstname: address.givenName,
                    lastname: address.familyName,
                    comapny: '',
                    street: [address.addressLines.join(' ')],
                    city: address.locality,
                    postcode: address.postalCode,
                    region: address.administrativeArea,
                    region_id: 0,
                    country_id: address.countryCode,
                    telephone: '0201234567',
                    save_in_address_book: 0,
                };

                return addressData;
            },
        };
    }
);
