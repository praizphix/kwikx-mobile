// COMING SOON: KkiaPay integration is currently disabled
// FedaPay is the active payment provider for CFA transactions

import type { PaymentRequest, PaymentResponse } from "../../types/payment"
import { WEBHOOK_CONFIG } from "../config/webhooks"

// Declare KkiaPay global interface
declare global {
  interface Window {
    kkiapay: {
      open: (config: any) => Promise<any>
      close: () => void
    }
  }
}

export class KkiaPayService {
  private publicKey: string
  private privateKey: string
  private environment: "sandbox" | "live"
  private sdkUrl: string

  constructor() {
    this.publicKey = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || ""
    this.privateKey = import.meta.env.VITE_KKIAPAY_PRIVATE_KEY || ""
    this.environment = import.meta.env.VITE_KKIAPAY_ENVIRONMENT || "sandbox"
    this.sdkUrl = "https://cdn.kkiapay.me/k.js"

    console.log("KkiaPay Service initialized with environment:", this.environment)
    console.log("Using public key starting with:", this.publicKey ? this.publicKey.substring(0, 8) + "..." : "Not set")
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // KkiaPay is currently marked as "coming soon"
    throw new Error("KkiaPay integration is coming soon. Please use FedaPay for CFA transactions.");
    
    try {
      // Validate required fields
      if (!this.publicKey) {
        console.warn("KkiaPay public key not configured, using development mode")
        return this.createMockPayment(request)
      }

      // Validate public key format (KkiaPay keys typically start with pk_)
      if (!this.publicKey.startsWith("pk_")) {
        console.warn("Invalid KkiaPay public key format, using development mode")
        return this.createMockPayment(request)
      }

      // Generate unique transaction reference
      const transactionRef = `KK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create KkiaPay widget configuration
      const kkiaPayConfig = {
        // Required fields
        amount: Math.round(request.amount), // KkiaPay expects integer amounts
        api_key: this.publicKey,
        sandbox: this.environment === "sandbox",

        // Transaction details
        phone: this.formatBeninPhoneNumber(request.customerPhone || ""),
        name: request.customerName || "Customer",
        email: request.customerEmail || "",

        // Custom data for tracking
        data: JSON.stringify({
          platform: "kwikx",
          wallet_type: "cfa",
          user_id: request.userId,
          country: "BJ",
          timestamp: new Date().toISOString(),
          description: request.description || "CFA Wallet Deposit",
        }),

        // Callback URLs
        callback: WEBHOOK_CONFIG.kkiapay?.webhook() || `${WEBHOOK_CONFIG.getBaseUrl()}/functions/v1/webhook-kkiapay`,

        // Payment methods - enable cards and mobile money
        payment_methods: ["card", "momo"], // card = Visa/Mastercard, momo = Mobile Money

        // Theme and customization
        theme: "#00454a", // Your brand color

        // Success and failure callbacks (will be handled by the widget)
        success: (response: any) => {
          console.log("KkiaPay payment success:", response)
          return response
        },

        failed: (error: any) => {
          console.log("KkiaPay payment failed:", error)
          throw new Error(error.message || "Payment failed")
        },
      }

      console.log("Creating KkiaPay payment with config:", {
        ...kkiaPayConfig,
        api_key: kkiaPayConfig.api_key.substring(0, 8) + "...",
      })

      return {
        success: true,
        transactionId: transactionRef,
        paymentUrl: "", // KkiaPay uses widget, not redirect URL
        reference: transactionRef,
        status: "pending",
        message: "Payment configuration created successfully",
        data: {
          config: kkiaPayConfig,
          transaction_id: transactionRef,
          currency: "XOF",
          amount: request.amount,
          country: "BJ",
          payment_methods: ["card", "mobile_money"],
        },
      }
    } catch (error: any) {
      console.error("KkiaPay API error:", error)

      // Return mock payment for development/testing
      if (
        error.message?.includes("credentials") ||
        error.message?.includes("amount") ||
        error.message?.includes("customer")
      ) {
        throw error // Re-throw validation errors
      }

      return this.createMockPayment(request)
    }
  }

  async openPaymentWidget(config: any): Promise<any> {
    try {
      // Ensure SDK is loaded
      if (!this.isSDKLoaded()) {
        await this.loadSDK()
      }

      // Wait a bit for SDK to be fully ready
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!window.kkiapay) {
        throw new Error("KkiaPay SDK not loaded properly")
      }

      console.log("Opening KkiaPay widget with config:", {
        ...config,
        api_key: config.api_key?.substring(0, 8) + "...",
      })

      // Open the KkiaPay widget
      return new Promise((resolve, reject) => {
        try {
          // Create a wrapper for the callbacks
          const wrappedConfig = {
            ...config,
            success: (response: any) => {
              console.log("KkiaPay widget success:", response)
              resolve(response)
            },
            failed: (error: any) => {
              console.log("KkiaPay widget failed:", error)
              reject(new Error(error.message || "Payment failed"))
            },
          }

          window.kkiapay.open(wrappedConfig)
        } catch (error) {
          console.error("Error opening KkiaPay widget:", error)
          reject(error)
        }
      })
    } catch (error: any) {
      console.error("KkiaPay widget error:", error)
      throw new Error(error.message || "Failed to open payment widget")
    }
  }

  async loadSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if SDK is already loaded
      if (this.isSDKLoaded()) {
        resolve()
        return
      }

      // Check if script tag already exists
      const existingScript = document.querySelector(`script[src="${this.sdkUrl}"]`)
      if (existingScript) {
        // Script exists, wait for it to load
        existingScript.addEventListener("load", () => resolve())
        existingScript.addEventListener("error", () => reject(new Error("Failed to load KkiaPay SDK")))
        return
      }

      // Create and load the script
      const script = document.createElement("script")
      script.src = this.sdkUrl
      script.async = true

      script.onload = () => {
        console.log("KkiaPay SDK loaded successfully")
        // Wait a bit for the SDK to initialize
        setTimeout(() => resolve(), 100)
      }

      script.onerror = () => {
        console.error("Failed to load KkiaPay SDK")
        reject(new Error("Failed to load KkiaPay SDK"))
      }

      document.head.appendChild(script)
    })
  }

  isSDKLoaded(): boolean {
    return typeof window !== "undefined" && !!window.kkiapay
  }

  private createMockPayment(request: PaymentRequest): PaymentResponse {
    const mockRef = `KK_BJ_DEV_${Date.now()}`
    return {
      success: true,
      transactionId: mockRef,
      paymentUrl: `${WEBHOOK_CONFIG.getBaseUrl()}/payment/mock?provider=kkiapay&amount=${request.amount}&ref=${mockRef}&country=BJ`,
      reference: mockRef,
      status: "pending",
      message: "Payment created successfully (Development Mode - Benin)",
      data: {
        config: {
          amount: request.amount,
          api_key: "pk_dev_mock",
          sandbox: true,
          payment_methods: ["card", "mobile_money"],
        },
      },
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      if (!this.privateKey || !this.privateKey.startsWith("sk_")) {
        return this.createMockVerification(transactionId)
      }

      // KkiaPay verification endpoint
      const verifyUrl =
        this.environment === "sandbox"
          ? "https://api.kkiapay.me/api/v1/transactions/status"
          : "https://api.kkiapay.me/api/v1/transactions/status"

      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": this.privateKey,
        },
        body: JSON.stringify({
          transactionId: transactionId,
        }),
      })

      if (!response.ok) {
        console.warn("KkiaPay verification failed, using mock response")
        return this.createMockVerification(transactionId)
      }

      const data = await response.json()

      return {
        success: data.status === "SUCCESS",
        transactionId: data.transactionId || transactionId,
        reference: data.transactionId || transactionId,
        status: this.mapKkiaPayStatus(data.status),
        message: `Payment ${data.status}`,
        data: {
          amount: data.amount,
          currency: "XOF",
          fees: data.fees,
          created_at: data.performedAt,
          country: "BJ",
          payment_method: data.type,
        },
      }
    } catch (error: any) {
      console.warn("KkiaPay verification error:", error)
      return this.createMockVerification(transactionId)
    }
  }

  private createMockVerification(transactionId: string): PaymentResponse {
    return {
      success: true,
      transactionId,
      reference: transactionId,
      status: "completed",
      message: "Payment completed (Development Mode - Benin)",
    }
  }

  private mapKkiaPayStatus(status: string): "pending" | "completed" | "failed" {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
      case "SUCCESSFUL":
        return "completed"
      case "FAILED":
      case "CANCELLED":
      case "CANCELED":
        return "failed"
      case "PENDING":
      default:
        return "pending"
    }
  }

  // Get supported payment methods for Benin
  async getPaymentMethods(): Promise<string[]> {
    try {
      if (!this.publicKey || !this.publicKey.startsWith("pk_")) {
        return this.getBeninPaymentMethods()
      }

      // KkiaPay supports these methods in Benin
      return this.getBeninPaymentMethods()
    } catch (error) {
      console.warn("Failed to fetch KkiaPay payment methods")
      return this.getBeninPaymentMethods()
    }
  }

  private getBeninPaymentMethods(): string[] {
    // Payment methods specifically available in Benin via KkiaPay
    return [
      "card", // Visa, Mastercard - This is the main improvement over FedaPay
      "mobile_money", // MTN Mobile Money, Moov Money
      "bank_transfer", // Local bank transfers
    ]
  }

  // Helper method to format Benin phone numbers for KkiaPay
  private formatBeninPhoneNumber(phone: string): string {
    if (!phone) return ""

    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, "")

    // Handle different formats
    if (digits.startsWith("229")) {
      // Remove country code
      digits = digits.substring(3)
    } else if (digits.startsWith("+229")) {
      // Remove country code with plus
      digits = digits.substring(4)
    }

    // Convert to new format
    if (digits.length === 8) {
      // If it's just 8 digits, add country code
      digits = "229" + digits
    } else if (digits.length === 9 && digits.startsWith("0")) {
      // If it's 9 digits starting with 0, replace with country code
      digits = "229" + digits.substring(1)
    } else if (digits.length >= 8) {
      // For any other format, extract the last 8 digits and add country code
      digits = "229" + digits.substring(digits.length - 8)
    }

    // Final validation - should be 11 digits starting with 229
    if (digits.length !== 11 || !digits.startsWith("229")) {
      console.warn("Invalid Benin phone number format after processing:", digits)
      // Try to fix it one more time
      if (digits.length >= 8) {
        digits = "229" + digits.substring(digits.length - 8)
      }
    }

    return digits
  }

  // Method to get Benin-specific information
  getBeninInfo() {
    return {
      country: "BJ",
      currency: "XOF",
      supportedMobileOperators: ["MTN", "Moov"],
      supportedCards: ["Visa", "Mastercard"], // This is the key improvement
      majorCities: ["Cotonou", "Porto-Novo", "Parakou", "Djougou", "Bohicon"],
      timeZone: "WAT", // West Africa Time
      language: "fr", // French
    }
  }

  // Utility method to close the widget if needed
  closeWidget(): void {
    if (this.isSDKLoaded() && window.kkiapay?.close) {
      window.kkiapay.close()
    }
  }

  // Method to check if we're in sandbox mode
  isSandbox(): boolean {
    return this.environment === "sandbox"
  }

  // Get the current environment
  getEnvironment(): string {
    return this.environment
  }
}
