<?php
/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace TIG\Buckaroo\Model\Plugin;

use Magento\Quote\Api\Data\TotalsExtensionInterface;
use Magento\Quote\Api\Data\TotalsExtensionFactory;
use Magento\Quote\Api\Data\TotalsInterface;
use Magento\Quote\Model\Cart\CartTotalRepository as TotalRepository;
use Magento\Quote\Model\Quote;

class CartTotalRepository
{
    /**
     * @var \Magento\Quote\Api\CartRepositoryInterface
     */
    protected $quoteRepository;

    /**
     * @var TotalsExtensionFactory
     */
    protected $totalsExtensionFactory;

    /**
     * @param \Magento\Quote\Api\CartRepositoryInterface $quoteRepository
     * @param TotalsExtensionFactory $totalsExtensionFactory
     */
    public function __construct(
        \Magento\Quote\Api\CartRepositoryInterface $quoteRepository,
        TotalsExtensionFactory $totalsExtensionFactory
    ) {
        $this->quoteRepository = $quoteRepository;
        $this->totalsExtensionFactory = $totalsExtensionFactory;
    }

    /**
     * @param TotalRepository $subject
     * @param \Closure $proceed
     * @param int $cartId
     * @return TotalsInterface
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    public function aroundGet(TotalRepository $subject, \Closure $proceed, $cartId)
    {
        /** @var TotalsInterface $totals */
        $totals = $proceed($cartId);

        /** @var Quote  $quote */
        $quote = $this->quoteRepository->getActive($cartId);

        /** @var \Magento\Quote\Api\Data\TotalsExtensionInterface $extensionAttributes */
        $extensionAttributes = $totals->getExtensionAttributes();
        if ($extensionAttributes === null) {
            $extensionAttributes = $this->totalsExtensionFactory->create();
        }

        $extensionAttributes->setBuckarooFee($quote->getBuckarooFee());
        $extensionAttributes->setBaseBuckarooFee($quote->getBaseBuckarooFee());

        $totals->setExtensionAttributes($extensionAttributes);

        return $totals;
    }
}