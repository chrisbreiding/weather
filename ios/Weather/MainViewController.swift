import UIKit

class MainViewController: UIViewController {
    var webViewController: WebViewController?

    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = .white
        view.translatesAutoresizingMaskIntoConstraints = false

        let webViewController = WebViewController()
        let webView = webViewController.view!

        self.webViewController = webViewController

        webView.frame = view.frame
        view.addSubview(webView)

        let guide = view.safeAreaLayoutGuide

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: guide.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: guide.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: guide.bottomAnchor),
            webView.topAnchor.constraint(equalTo: guide.topAnchor)
        ])
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .darkContent
    }
}
