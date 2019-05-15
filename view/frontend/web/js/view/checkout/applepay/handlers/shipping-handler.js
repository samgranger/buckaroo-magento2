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
        'Magento_Checkout/js/action/create-shipping-address',
        'Magento_Checkout/js/action/select-shipping-address',
        'Magento_Checkout/js/action/select-billing-address',
        'Magento_Checkout/js/model/shipping-save-processor/payload-extender',
        'Magento_Checkout/js/checkout-data'
    ],
    function (
        $,
        urlBuilder,
        resourceUrlManager,
        quote,
        createShippingAddress,
        selectShippingAddress,
        selectBillingAddress,
        payloadExtender,
        checkoutData
    ) {
        'use strict';

        return {
            setShippingAddress: function (address) {
                var addressData = this.getAddressData(address);

                var newShippingAddress = createShippingAddress(addressData);
                selectShippingAddress(newShippingAddress);
                checkoutData.setSelectedShippingAddress(newShippingAddress.getKey());
                checkoutData.setNewCustomerShippingAddress($.extend(true, {}, addressData));
            },

            saveShipmentInfo: function () {
                var payload;

                if (!quote.billingAddress()) {
                    selectBillingAddress(quote.shippingAddress());
                }

                payload = {
                    addressInformation: {
                        'shipping_address': quote.shippingAddress(),
                        'billing_address': quote.billingAddress(),
                        'shipping_method_code': quote.shippingMethod()['method_code'],
                        'shipping_carrier_code': quote.shippingMethod()['carrier_code']
                    }
                };

                payloadExtender(payload);

                var url = resourceUrlManager.getUrlForSetShippingInformation(quote);

                $.ajax({
                    url: urlBuilder.build(url),
                    type: 'POST',
                    data: JSON.stringify(payload),
                    global: false,
                    contentType: 'application/json',
                    async: false
                });
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
                    email: address.emailAddress,
                    save_in_address_book: 0,
                };

                return addressData;
            },
        };
    }
);
