# 🔄 Payment Redirect Guide - submonth.com

## 📋 Overview
এই গাইডটি দেখায় কিভাবে RupantorPay পেমেন্ট সিস্টেম submonth.com এ রিডাইরেক্ট কাজ করে।

## 🎯 রিডাইরেক্ট ফ্লো

### 1. পেমেন্ট ক্যান্সেল হলে ✅

**ফ্লো:**
```
Customer cancels payment on RupantorPay 
    ↓
RupantorPay redirects to: submonth.com/payment/cancel
    ↓
Shows cancellation page with details
    ↓
Auto redirects to homepage after 5 seconds
    ↓
Lands on: submonth.com
```

**বৈশিষ্ট্য:**
- ✅ ক্যান্সেলেশন বিস্তারিত দেখায়
- ✅ ৫ সেকেন্ড পর অটো-রিডাইরেক্ট
- ✅ "You will be redirected to homepage automatically in 5 seconds" নোটিফিকেশন
- ✅ ম্যানুয়ালি হোম পেজে যাওয়ার বাটন

### 2. পেমেন্ট সফল হলে ✅

**ফ্লো:**
```
Customer completes payment on RupantorPay
    ↓
RupantorPay redirects to: submonth.com/payment/success?transactionID=...
    ↓
System verifies payment with RupantorPay API
    ↓
Shows success page with payment details
    ↓
Auto redirects to homepage after 3 seconds
    ↓
Lands on: submonth.com
```

**বৈশিষ্ট্য:**
- ✅ পেমেন্ট ভেরিফিকেশন
- ✅ ট্রানজেকশন আইডি মিলিয়ে নেয়
- ✅ RupantorPay নোটিফিকেশন দেখায়
- ✅ ৩ সেকেন্ড পর অটো-রিডাইরেক্ট
- ✅ "Payment verified! You will be redirected to homepage automatically in 3 seconds" নোটিফিকেশন

## 🔧 টেকনিক্যাল কনফিগারেশন

### API এন্ডপয়েন্ট
```javascript
// Payment Creation API
success_url: `${origin}/payment/success`
cancel_url: `${origin}/payment/cancel`
```

### রিডাইরেক্ট টাইমআউট
- **সাকসেস পেজ**: ৩ সেকেন্ড
- **ক্যান্সেল পেজ**: ৫ সেকেন্ড

### পেজ স্ট্রাকচার
```
/payment/success  → ভেরিফিকেশন → অটো-রিডাইরেক্ট → /
/payment/cancel   → নোটিফিকেশন → অটো-রিডাইরেক্ট → /
```

## 🎨 ইউজার এক্সপিরিয়েন্স

### ক্যান্সেল পেজ
- 🔴 লাল ক্যান্সেল আইকন
- 📝 "Payment Cancelled" মেসেজ
- ℹ️ ব্লু নোটিফিকেশন: "You will be redirected to homepage automatically in 5 seconds"
- 🔄 অটো-রিডাইরেক্ট কাউন্টডাউন
- 🏠 ম্যানুয়াল রিডাইরেক্ট অপশন

### সাকসেস পেজ
- 🟢 সবুজ সাকসেস আইকন
- 📝 "Payment Successful!" মেসেজ
- ✅ গ্রীন নোটিফিকেশন: "Payment verified! You will be redirected to homepage automatically in 3 seconds"
- 🔍 পেমেন্ট ডিটেইলস ভেরিফিকেশন
- 🏠 অটো-রিডাইরেক্ট টু হোম

## 🧪 টেস্টিং

### টেস্ট কেস ১: পেমেন্ট ক্যান্সেল
1. প্রোডাক্ট কিনুন
2. RupantorPay পেমেন্ট পেজে যান
3. পেমেন্ট ক্যান্সেল করুন
4. দেখুন: `/payment/cancel` পেজে রিডাইরেক্ট হয়
5. ৫ সেকেন্ড পর হোম পেজে রিডাইরেক্ট হয়

### টেস্ট কেস ২: পেমেন্ট সাকসেস
1. প্রোডাক্ট কিনুন
2. RupantorPay পেমেন্ট পেজে যান
3. পেমেন্ট সম্পূর্ণ করুন
4. দেখুন: `/payment/success` পেজে রিডাইরেক্ট হয়
5. ভেরিফিকেশন হয়
6. ৩ সেকেন্ড পর হোম পেজে রিডাইরেক্ট হয়

## 🚀 প্রোডাকশন রেডি

সব রিডাইরেক্ট ফিচার পুরোপুরি কাজ করছে:

- ✅ ক্যান্সেল রিডাইরেক্ট: submonth.com/payment/cancel → submonth.com (৫ সেকেন্ড)
- ✅ সাকসেস রিডাইরেক্ট: submonth.com/payment/success → submonth.com (৩ সেকেন্ড)
- ✅ ট্রানজেকশন আইডি ভেরিফিকেশন
- ✅ RupantorPay নোটিফিকেশন সিস্টেম
- ✅ ইউজার ফ্রেন্ডলি নোটিফিকেশন

আপনার RupantorPay পেমেন্ট সিস্টেম এখন সম্পূর্ণ রেডি! 🎉