import { useState, useEffect } from 'react'
import { ShopItem } from '../types'
import { getCart, setCart as saveCart } from '../utils/sessionStorageManager'

export function useCart() {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [inputValues, setInputValues] = useState<Record<string, string>>({})

  // Load cart from sessionStorage on mount
  useEffect(() => {
    const storedCart = getCart()
    if (storedCart) {
      setQuantities(storedCart)

      // Initialize input values from saved quantities
      const inputVals: Record<string, string> = {}
      Object.keys(storedCart).forEach(itemId => {
        if (storedCart[itemId] > 0) {
          inputVals[itemId] = String(storedCart[itemId])
        }
      })
      setInputValues(inputVals)
    }
  }, [])

  const updateCart = (newQuantities: Record<string, number>) => {
    setQuantities(newQuantities)
    saveCart(newQuantities)
  }

  const handleBuy = (item: ShopItem, balance: number): number => {
    // Buy 1 item at a time
    if (balance >= item.price) {
      const newQuantity = (quantities[item.id] || 0) + 1
      const newQuantities = {
        ...quantities,
        [item.id]: newQuantity,
      }
      updateCart(newQuantities)
      setInputValues(prev => ({
        ...prev,
        [item.id]: String(newQuantity),
      }))
      return balance - item.price
    }
    return balance
  }

  const handleSell = (item: ShopItem, balance: number): number => {
    const quantity = quantities[item.id] || 0
    if (quantity > 0) {
      const newQuantities = {
        ...quantities,
        [item.id]: quantity - 1,
      }
      updateCart(newQuantities)
      setInputValues(prev => ({
        ...prev,
        [item.id]: String(quantity - 1),
      }))
      return balance + item.price
    }
    return balance
  }

  const handleQuantityChange = (itemId: string, value: string) => {
    // Allow empty string while typing
    setInputValues(prev => ({
      ...prev,
      [itemId]: value,
    }))
  }

  const handleQuantityBlur = (item: ShopItem, balance: number): number => {
    const itemId = item.id
    const inputValue = inputValues[itemId] || ''
    const currentQuantity = quantities[itemId] || 0

    // If empty on blur, set to 0 and refund money
    if (inputValue === '' || inputValue === '-') {
      const refund = currentQuantity * item.price
      const newQuantities = {
        ...quantities,
        [itemId]: 0,
      }
      updateCart(newQuantities)
      setInputValues(prev => ({
        ...prev,
        [itemId]: '0',
      }))
      return balance + refund
    }

    const newQuantity = parseInt(inputValue)
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      const quantityDiff = newQuantity - currentQuantity

      // If increasing quantity and don't have enough funds, cap to max affordable
      if (quantityDiff > 0) {
        const maxAffordable = currentQuantity + Math.floor(balance / item.price)
        const finalQuantity = Math.min(newQuantity, maxAffordable)
        const actualDiff = finalQuantity - currentQuantity
        const costDiff = actualDiff * item.price

        // Update quantity and balance
        const newQuantities = {
          ...quantities,
          [itemId]: finalQuantity,
        }
        updateCart(newQuantities)
        setInputValues(prev => ({
          ...prev,
          [itemId]: String(finalQuantity),
        }))
        return balance - costDiff
      } else {
        // Decreasing quantity (selling back) - always allowed
        const costDiff = quantityDiff * item.price
        const newQuantities = {
          ...quantities,
          [itemId]: newQuantity,
        }
        updateCart(newQuantities)
        setInputValues(prev => ({
          ...prev,
          [itemId]: String(newQuantity),
        }))
        return balance - costDiff // costDiff is negative, so this adds money
      }
    } else {
      // Invalid input, revert to current quantity
      setInputValues(prev => ({
        ...prev,
        [itemId]: String(currentQuantity),
      }))
      return balance
    }
  }

  return {
    quantities,
    inputValues,
    handleBuy,
    handleSell,
    handleQuantityChange,
    handleQuantityBlur,
  }
}
