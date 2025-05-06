import Foundation
import UIKit // Needed for UIViewController

// Define a protocol that abstracts the GIDSignIn functionality we need.
// This allows us to inject a mock object during testing.
protocol GoogleSignInProtocol {
    // We need the ability to initiate the sign-in flow.
    // We use the UIKit version signature here as SwiftUI flows often still need the root VC.
    // The real GIDSignIn uses a GIDSignInResult, but we don't need it for testing
    // the *initiation* specifically, so we simplify the mock completion handler.
    // A real app might define a custom result type or use the real GIDSignInResult.
    func signIn(withPresenting presentingViewController: UIViewController,
                completion: ((_ success: Bool, _ error: Error?) -> Void)?)
    
    // In a real app, you might add other methods/properties like:
    // var currentUser: GIDGoogleUser? { get }
    // func restorePreviousSignIn(...) async throws -> GIDGoogleUser
    // func signOut()
    // var configuration: GIDConfiguration? { get set }
} 