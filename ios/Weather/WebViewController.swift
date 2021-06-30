import SwiftUI
import WebKit
import MapKit
import CoreLocation

class WebViewHelper: NSObject, WKNavigationDelegate {
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("webview didFinishNavigation")

        NotificationCenter.default.post(name: .didFinishNavigation, object: nil)
    }
}

class WebViewController: UIViewController, CLLocationManagerDelegate, WKScriptMessageHandler {
    let navigationHelper = WebViewHelper()
    var progressView: UIActivityIndicatorView?

    let url = URL(string: "SET ME")

    private lazy var webView: WKWebView = {
        let webView = WKWebView(frame: self.view.frame)
        webView.translatesAutoresizingMaskIntoConstraints = false
        return webView
    }()

    override func viewDidLoad() {
        super.viewDidLoad()

        NotificationCenter.default.addObserver(self, selector: #selector(didFinishNavigation(notification:)), name: .didFinishNavigation, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(didBecomeActive(notification:)), name: .didBecomeActive, object: nil)

        view.translatesAutoresizingMaskIntoConstraints = false

        webView.frame = view.frame

        view.addSubview(webView)

        let guide = view.safeAreaLayoutGuide

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: guide.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: guide.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: guide.bottomAnchor),
            webView.topAnchor.constraint(equalTo: guide.topAnchor)
        ])

        webView.navigationDelegate = navigationHelper
        webView.configuration.userContentController.add(self, name: "bus")

        print("start navigation")
        let progressView = UIActivityIndicatorView(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
        progressView.style = .large
        progressView.color = .gray
        progressView.translatesAutoresizingMaskIntoConstraints = false
        self.progressView = progressView
        view.addSubview(progressView)
        progressView.startAnimating()

        progressView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        progressView.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true

        let request = URLRequest(url: self.url, cachePolicy: .returnCacheDataElseLoad)
        webView.load(request)
    }

    @objc func didFinishNavigation(notification: NSNotification) {
        progressView?.stopAnimating()
        progressView?.removeFromSuperview()
    }

    @objc func didBecomeActive(notification: NSNotification) {
        print("got onActive notification")

        webView.evaluateJavaScript("if (window.__onMessage) window.__onMessage('didBecomeActive')")
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive scriptMessage: WKScriptMessage) {
        guard let message = scriptMessage.body as? String else {
            return
        }

        print("received webview message: \(message)")

        if message == "get:user:location" {
            getUserLocation()
        }
    }

    func getUserLocation() {
        let locationManager = CLLocationManager()
        locationManager.requestWhenInUseAuthorization()

        if CLLocationManager.locationServicesEnabled() {
            print("get user location")
            locationManager.delegate = self
            locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
            locationManager.requestLocation()
        } else {
            print("location services not enabled - cannot get user location")
            sendLocation(nil)
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location: CLLocationCoordinate2D = manager.location?.coordinate else { return }
        print("user location: \(location.latitude) \(location.longitude)")

        sendLocation(location)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("getting user location failed: \(error)")
        sendLocation(nil)
    }

    func sendLocation(_ location: CLLocationCoordinate2D?) {
        let arg = location == nil ? "false" : "{ latitude: '\(location!.latitude)', longitude: '\(location!.longitude)' }"

        webView.evaluateJavaScript("if (window.__onUserLocation) window.__onUserLocation(\(arg))")
    }
}
