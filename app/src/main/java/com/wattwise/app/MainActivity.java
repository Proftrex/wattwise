package com.wattwise.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

```
private WebView webView;
private LinearLayout loadingView;

private static final String APP_URL =
        "https://script.google.com/macros/s/AKfycbxA4XcCK68UKhkDvTf75Glr5XRBvtI7iwpg7sjnvGfoACdjdxSdMRhLIXLK_s61ZWacyg/exec";

@SuppressLint("SetJavaScriptEnabled")
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    createLoadingScreen();

    webView = new WebView(this);

    configureWebView();

    FrameLayout root = new FrameLayout(this);

    root.addView(
            webView,
            new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
            )
    );

    root.addView(
            loadingView,
            new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
            )
    );

    webView.setVisibility(View.INVISIBLE);

    setContentView(root);

    webView.loadUrl(APP_URL);

    setupBackNavigation();
}

private void createLoadingScreen() {

    loadingView = new LinearLayout(this);

    loadingView.setOrientation(LinearLayout.VERTICAL);
    loadingView.setGravity(Gravity.CENTER);
    loadingView.setBackgroundColor(Color.WHITE);

    TextView logo = new TextView(this);

    logo.setText("⚡");
    logo.setTextSize(48);
    logo.setGravity(Gravity.CENTER);

    loadingView.addView(logo);

    TextView title = new TextView(this);

    title.setText("WattWise");
    title.setTextSize(28);
    title.setTextColor(Color.rgb(40, 40, 40));
    title.setGravity(Gravity.CENTER);

    loadingView.addView(title);

    TextView subtitle = new TextView(this);

    subtitle.setText("Understand where your electricity goes.");
    subtitle.setTextSize(14);
    subtitle.setTextColor(Color.rgb(110, 110, 110));
    subtitle.setGravity(Gravity.CENTER);

    LinearLayout.LayoutParams subtitleParams =
            new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
            );

    subtitleParams.setMargins(0, 12, 0, 24);

    loadingView.addView(subtitle, subtitleParams);

    ProgressBar progressBar = new ProgressBar(this);

    loadingView.addView(progressBar);
}

@SuppressLint("SetJavaScriptEnabled")
private void configureWebView() {

    WebSettings settings = webView.getSettings();

    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setDatabaseEnabled(true);

    settings.setAllowFileAccess(true);
    settings.setAllowContentAccess(true);

    settings.setBuiltInZoomControls(false);
    settings.setDisplayZoomControls(false);

    settings.setLoadWithOverviewMode(false);
    settings.setUseWideViewPort(false);

    settings.setUserAgentString(
            settings.getUserAgentString()
                    + " WattWiseAndroid/1.0"
    );

    webView.setBackgroundColor(Color.WHITE);

    webView.setWebChromeClient(new WebChromeClient());

    webView.setWebViewClient(new WebViewClient() {

        @Override
        public void onPageFinished(
                WebView view,
                String url
        ) {

            loadingView.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);

            super.onPageFinished(view, url);
        }

        @Override
        public void onReceivedError(
                WebView view,
                WebResourceRequest request,
                android.webkit.WebResourceError error
        ) {

            if (request.isForMainFrame()) {
                showErrorScreen();
            }

            super.onReceivedError(view, request, error);
        }

        @Override
        public boolean shouldOverrideUrlLoading(
                WebView view,
                WebResourceRequest request
        ) {

            Uri uri = request.getUrl();

            String scheme = uri.getScheme();

            if ("http".equalsIgnoreCase(scheme)
                    || "https".equalsIgnoreCase(scheme)) {

                return false;
            }

            try {

                Intent intent =
                        new Intent(Intent.ACTION_VIEW, uri);

                startActivity(intent);

            } catch (Exception ignored) {
            }

            return true;
        }

        @Override
        public boolean shouldOverrideUrlLoading(
                WebView view,
                String url
        ) {

            Uri uri = Uri.parse(url);

            String scheme = uri.getScheme();

            if ("http".equalsIgnoreCase(scheme)
                    || "https".equalsIgnoreCase(scheme)) {

                return false;
            }

            try {

                Intent intent =
                        new Intent(Intent.ACTION_VIEW, uri);

                startActivity(intent);

            } catch (Exception ignored) {
            }

            return true;
        }
    });
}

private void showErrorScreen() {

    loadingView.removeAllViews();

    TextView icon = new TextView(this);

    icon.setText("⚠️");
    icon.setTextSize(42);
    icon.setGravity(Gravity.CENTER);

    loadingView.addView(icon);

    TextView title = new TextView(this);

    title.setText("Unable to load WattWise");
    title.setTextSize(22);
    title.setTextColor(Color.rgb(40, 40, 40));
    title.setGravity(Gravity.CENTER);

    LinearLayout.LayoutParams titleParams =
            new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
            );

    titleParams.setMargins(0, 16, 0, 8);

    loadingView.addView(title, titleParams);

    TextView message = new TextView(this);

    message.setText(
            "Please check your internet connection and try again."
    );

    message.setTextSize(14);
    message.setTextColor(Color.rgb(110, 110, 110));
    message.setGravity(Gravity.CENTER);

    loadingView.addView(message);

    TextView retry = new TextView(this);

    retry.setText("Retry");
    retry.setTextSize(16);
    retry.setTextColor(Color.rgb(255, 255, 255));
    retry.setGravity(Gravity.CENTER);
    retry.setBackgroundColor(Color.rgb(121, 216, 98));
    retry.setPadding(40, 20, 40, 20);

    LinearLayout.LayoutParams retryParams =
            new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
            );

    retryParams.setMargins(0, 24, 0, 0);

    loadingView.addView(retry, retryParams);

    retry.setOnClickListener(v -> {

        loadingView.removeAllViews();

        createLoadingScreen();

        loadingView.setVisibility(View.VISIBLE);
        webView.setVisibility(View.INVISIBLE);

        webView.reload();
    });

    loadingView.setVisibility(View.VISIBLE);
    webView.setVisibility(View.INVISIBLE);
}

private void setupBackNavigation() {

    getOnBackPressedDispatcher().addCallback(
            this,
            new OnBackPressedCallback(true) {

                @Override
                public void handleOnBackPressed() {

                    if (webView != null && webView.canGoBack()) {

                        webView.goBack();

                    } else {

                        finish();
                    }
                }
            }
    );
}

@Override
protected void onDestroy() {

    if (webView != null) {

        webView.stopLoading();

        webView.setWebChromeClient(null);
        webView.setWebViewClient(null);

        webView.destroy();

        webView = null;
    }

    super.onDestroy();
}
```

}
