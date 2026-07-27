import {
  addPhoneCodeSentListener,
  addPhoneVerificationCompletedListener,
  addPhoneVerificationFailedListener,
  signInWithPhoneNumberNative,
  confirmVerificationCodeNative,
} from "@/integrations/firebase/capacitorAuth";

export class PhoneVerificationManager {
  private static instance: PhoneVerificationManager;

  private verificationId: string | null = null;
  private autoVerifiedUser: any = null;
  private verificationError: string | null = null;

  private codeSentListener: any = null;
  private completedListener: any = null;
  private failedListener: any = null;

  private constructor() {}

  static getInstance(): PhoneVerificationManager {
    if (!PhoneVerificationManager.instance) {
      PhoneVerificationManager.instance =
        new PhoneVerificationManager();
    }

    return PhoneVerificationManager.instance;
  }

  reset() {
    this.verificationId = null;
    this.autoVerifiedUser = null;
    this.verificationError = null;
  }

  async cleanupListeners() {
    await this.codeSentListener?.remove?.();
    await this.completedListener?.remove?.();
    await this.failedListener?.remove?.();

    this.codeSentListener = null;
    this.completedListener = null;
    this.failedListener = null;
  }


  async startVerification(phoneNumber: string) {
    this.reset();
    console.log("OTP: startVerification", phoneNumber);
    await this.cleanupListeners();

    return await new Promise<void>(async (resolve, reject) => {
      this.codeSentListener = await addPhoneCodeSentListener(
        (event: any) => {
          console.log("OTP: phoneCodeSent", event);
          this.verificationId = event?.verificationId || null;
          resolve();
        },
      );

      this.completedListener =
        await addPhoneVerificationCompletedListener(
          (event: any) => {
            console.log("OTP: phoneVerificationCompleted", event);
            this.autoVerifiedUser =
              event?.result?.user || event?.user || null;
          },
        );

      this.failedListener =
        await addPhoneVerificationFailedListener(
          (event: any) => {
            console.log("OTP: phoneVerificationFailed", event);
            this.verificationError =
              event?.message || "Phone verification failed";
            reject(new Error(this.verificationError));
          },
        );

      try {
        console.log("OTP: calling signInWithPhoneNumberNative");
        await signInWithPhoneNumberNative({
          phoneNumber,
        });
        console.log("OTP: native call completed");
      } catch (error) {
        reject(error);
      }
    });
  }


  async confirmCode(code: string) {
    if (this.verificationError) {
      throw new Error(this.verificationError);
    }

    if (this.autoVerifiedUser) {
      return {
        user: this.autoVerifiedUser,
      };
    }

    if (!this.verificationId) {
      throw new Error(
        "Verification ID not received from phoneCodeSent listener.",
      );
    }

    return await confirmVerificationCodeNative({
      verificationId: this.verificationId,
      verificationCode: code,
    });
  }

  getVerificationId() {
    return this.verificationId;
  }

  getAutoVerifiedUser() {
    return this.autoVerifiedUser;
  }

  getVerificationError() {
    return this.verificationError;
  }
}

export default PhoneVerificationManager;
