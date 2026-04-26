import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// Optional: reuse components shipped by @bndynet/docs
// import HomepageFeatures from '@site/src/components/HomepageFeatures';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <iframe
        id="frontpageFrame"
        src="https://bndy.net/GitHubVisualizer/#user=bndynet"
        frameBorder="0"
        allowFullScreen
        style={{
          width: '100%',
          height: 'calc(100vh - 56px)',
          margin: 0,
        }}
      ></iframe>

      <section className='container' id="projects">
        <div class="col-md-4 widget">
          <a href="https://github.com/bndynet/web-framework-for-java">
            <img src="https://raw.githubusercontent.com/bndynet/web-framework-for-java/master/docs/img/admin-home.png" />
          </a>
          <h2>Web Framework 4 Java</h2>
          <p>A starter project with spring boot for AngularJS, AngularJs Material, Thymeleaf, RESTful API, MySQL, Redis and MongoDB.</p>
        </div>

        <div class="col-md-4 widget">
          <a href="https://github.com/bndynet/web-framework">
            <img src="https://raw.githubusercontent.com/bndynet/web-framework/master/screenshots/home.png" />
          </a>
          <h2>Web Framework 4 .Net</h2>
          <p>
            The Web Framework is a project for building great Web sites and Web
            applications using C# fast and easily. Frontend is using AngularJS
            and Bootstarp.
          </p>
        </div>

        <div class="col-md-4 widget">
          <a href="https://admin-react.bndy.net">
            <img src="https://raw.githubusercontent.com/bndynet/admin-template-for-react/master/docs/images/admin-home.png" />
          </a>
          <h2>Admin for React</h2>
          <p>
            A starter admin template with React, React Redux, Material UI and
            TypeScript that packages using Webpack and integrates a minimal
            project structure.
          </p>
        </div>

        <div class="col-md-4 widget">
          <a href="https://bndynet.github.io/bbootstrap/">
            <img src="https://raw.githubusercontent.com/bndynet/bbootstrap/master/screenshots/home.png" />
          </a>
          <h2>Bbootstrap</h2>
          <p>
            Enhancement integrated useful components and based on bootstrap 4
            for best UI.
          </p>
        </div>

        <div class="col-md-4 widget">
          <a href="https://github.com/bndynet/android-starter">
            <img src="https://th.bing.com/th/id/R.22bec9984f8753eb4067350a4b4c2574?rik=I%2fGeQLRoty2PXQ&amp;riu=http%3a%2f%2fwww.thetop10s.net%2fwp-content%2fuploads%2f2013%2f07%2fandroid.jpg&amp;ehk=vaM7j9BpVLZGWKD4NRDcIyUVjb6ynu8SwI8uJicsFq8%3d&amp;risl=&amp;pid=ImgRaw&amp;r=0&amp;sres=1&amp;sresct=1" />
          </a>
          <h2>Android Starter Project</h2>
          <p>
            A starter project for Android with useful UI components(like table,
            splash screen...), HTTP utils, Database utils and custom UI for
            using barcode scanner.
          </p>
        </div>

        <div class="col-md-4 widget">
          <a href="https://github.com/bndynet/spring-cloud-starter">
            <img src="/assets/img/spring-cloud.png" />
          </a>
          <h2>Spring Cloud Starter</h2>
          <p>
            A starter project for spring cloud implemented Single Sign On
            service and OAuth service.
          </p>
        </div>
      </section>
    </Layout>
  );
}
