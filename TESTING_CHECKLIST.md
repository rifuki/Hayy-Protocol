# ✅ Testing Checklist - Collateral Status Feature

## Pre-Testing Setup

- [ ] Backend relayer is running (`npm run dev` di `hayyprotocol-backend`)
- [ ] Frontend is running (`npm run dev` di `hayyprotocol-fe`)
- [ ] Stacks wallet extension installed (Leather/Hiro)
- [ ] Sui wallet extension installed (Sui Wallet)
- [ ] Both wallets have testnet tokens
- [ ] API endpoint accessible: `http://localhost:3001/api/collateral-status/[address]`

---

## Test Case 1: Happy Path - Normal Deposit

### Steps:
1. [ ] Navigate to Borrow page → Stacks tab
2. [ ] Connect Stacks wallet
3. [ ] Connect Sui wallet (auto-fills Sui address)
4. [ ] Enter deposit amount (e.g., 1 STX)
5. [ ] Click "Deposit Collateral"
6. [ ] Confirm transaction in wallet popup

### Expected Results:
- [ ] Toast appears: "🔄 Transaction Submitted"
- [ ] After confirmation: Toast "✅ Transaction Confirmed!"
- [ ] Blue banner appears: "⏳ Processing Your Deposit"
- [ ] Progress bar animates 0% → ~40%
- [ ] Status: "Waiting for transaction to be detected..."
- [ ] Est. time shown: "10-30 seconds"

### Wait 10-30 seconds:
- [ ] Banner updates: "Registering on Sui..."
- [ ] Progress bar: 40% → 90%
- [ ] Est. time: "15-45 seconds"

### Wait 15-45 seconds total:
- [ ] Banner turns green ✅
- [ ] Status: "Ready to Borrow!"
- [ ] Shows collateral: "X STX" and "$Y borrow power"
- [ ] Progress bar: 100%
- [ ] Toast: "🎉 Ready to Borrow!"

### Wait 5 more seconds:
- [ ] Banner auto-hides
- [ ] Position data refreshed
- [ ] Can now borrow on Sui tab

---

## Test Case 2: Already Registered (Repeat Deposit)

### Steps:
1. [ ] After first deposit completes
2. [ ] Deposit again (another 1 STX)
3. [ ] Confirm transaction

### Expected Results:
- [ ] Banner appears briefly: "Processing..."
- [ ] Quickly changes to: "Ready to Borrow!" (faster registration)
- [ ] Total collateral updated
- [ ] Auto-hides after 5s

---

## Test Case 3: Network Delay

### Steps:
1. [ ] Slow down relayer polling (increase interval)
2. [ ] Deposit STX
3. [ ] Observe banner behavior

### Expected Results:
- [ ] Banner stays in "Waiting..." state longer
- [ ] Progress bar stays at <50% longer
- [ ] No errors shown
- [ ] Eventually transitions to "Registering..."
- [ ] Eventually completes successfully

---

## Test Case 4: Transaction Cancelled

### Steps:
1. [ ] Click "Deposit Collateral"
2. [ ] Click "Reject" in wallet popup

### Expected Results:
- [ ] Toast: "Transaction Cancelled"
- [ ] No banner appears
- [ ] Can try again
- [ ] No errors in console

---

## Test Case 5: Disconnected Wallet

### Steps:
1. [ ] Disconnect Stacks wallet
2. [ ] Try to deposit

### Expected Results:
- [ ] Toast: "Wallet Connection Required"
- [ ] No banner
- [ ] Button disabled or shows "Connect Wallet"

---

## Test Case 6: Invalid Sui Address

### Steps:
1. [ ] Manually enter invalid Sui address (too short/wrong format)
2. [ ] Try to deposit

### Expected Results:
- [ ] Toast: "Invalid Sui Address"
- [ ] Shows format requirement
- [ ] No transaction initiated

---

## Test Case 7: Backend Offline

### Steps:
1. [ ] Stop backend server
2. [ ] Deposit STX (transaction still goes through)
3. [ ] Banner should appear

### Expected Results:
- [ ] Banner shows: "Processing..."
- [ ] After retries: Shows error state
- [ ] Error message: "Failed to check status"
- [ ] User can manually refresh page

---

## Test Case 8: Multiple Tabs

### Steps:
1. [ ] Open Borrow page in 2 tabs
2. [ ] Deposit in tab 1
3. [ ] Check tab 2

### Expected Results:
- [ ] Tab 1: Banner shows normally
- [ ] Tab 2: Should also update (React Query cache sync)
- [ ] Both tabs show updated collateral

---

## Test Case 9: Page Refresh During Registration

### Steps:
1. [ ] Deposit STX
2. [ ] Wait for "Registering..." state
3. [ ] Refresh page

### Expected Results:
- [ ] Banner re-appears automatically
- [ ] Continues polling
- [ ] Eventually shows "Ready to Borrow!"
- [ ] No duplicate registrations

---

## Test Case 10: Mobile Responsiveness

### Steps:
1. [ ] Open on mobile device or Chrome DevTools mobile view
2. [ ] Deposit STX
3. [ ] Observe banner

### Expected Results:
- [ ] Banner fits screen width
- [ ] Text not truncated
- [ ] Progress bar visible
- [ ] Touch targets large enough
- [ ] Auto-hide works

---

## Performance Checks

- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Polling stops after success (check Network tab)
- [ ] No excessive re-renders (React DevTools Profiler)
- [ ] Page remains responsive during polling
- [ ] CPU usage reasonable (<10% during polling)

---

## Browser Compatibility

Test in:
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)

---

## Edge Cases

- [ ] Very small deposit (0.001 STX)
- [ ] Very large deposit (1000 STX)
- [ ] Decimal values with many digits (1.123456789)
- [ ] Back button during processing
- [ ] Navigate away and come back
- [ ] Rapid deposits (deposit 3x in a row)

---

## Console Checks

### Should NOT see:
- ❌ Uncaught errors
- ❌ Failed network requests (except expected retries)
- ❌ React warnings (key, hooks, etc.)
- ❌ Memory warnings

### Should see:
- ✅ "Fetching collateral status..." (normal)
- ✅ Status updates logged
- ✅ Poll interval logs

---

## API Endpoint Manual Test

### Test endpoint directly:
```bash
# Test with your Stacks address
curl http://localhost:3001/api/collateral-status/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Expected response:
{
  "status": "registered",  // or "pending"
  "message": "...",
  "stacksAddress": "ST1P...",
  "suiAddress": "0x...",
  "collateral": {
    "stxAmount": 10.5,
    "borrowPower": 158.50,
    "objectId": "0x..."
  }
}
```

---

## Success Criteria

### Must Pass:
- ✅ All happy path scenarios work
- ✅ No console errors
- ✅ Banner auto-hides after success
- ✅ Polling stops after registration
- ✅ UI remains responsive

### Nice to Have:
- ✅ Smooth animations
- ✅ Accurate time estimates
- ✅ Works on mobile
- ✅ Dark mode looks good

---

## Known Issues / Limitations

1. **Polling Delay**: 2-second intervals might feel slow (acceptable)
2. **No Retry Button**: User must refresh if stuck (future improvement)
3. **No Sound**: No audio notification when ready (optional feature)
4. **Time Estimates**: Rough estimates, not guaranteed (acceptable)

---

## Debugging Tips

### If banner doesn't appear:
1. Check: Is `showProcessingBanner` state set?
2. Check: Is `depositedStacksAddress` populated?
3. Check: Component mounted and props passed correctly?

### If status stuck on "pending":
1. Check: Backend relayer running?
2. Check: API endpoint responding?
3. Check: Network tab for failed requests
4. Check: Sui address mapped correctly in backend state?

### If polling doesn't stop:
1. Check: `status === 'registered'` condition
2. Check: React Query refetchInterval logic
3. Check: Component cleanup on unmount

---

## Test Results Log

| Test Case | Status | Notes |
|-----------|--------|-------|
| Happy Path | [ ] | |
| Repeat Deposit | [ ] | |
| Network Delay | [ ] | |
| Cancelled Tx | [ ] | |
| Disconnected | [ ] | |
| Invalid Address | [ ] | |
| Backend Offline | [ ] | |
| Multiple Tabs | [ ] | |
| Page Refresh | [ ] | |
| Mobile | [ ] | |

**Tested by**: ___________________
**Date**: ___________________
**Browser**: ___________________
**OS**: ___________________
