import React from "react";
import { useState, useEffect } from "react";
import ReactGA from "react-ga";

export default function About() {
  useEffect(() => {
    ReactGA.pageview("/about");
    var elems = document.querySelectorAll(".collapsible");
    var instances = M.Collapsible.init(elems);
  }, []);
  return (
    <div className="row">
      <div className="col s12 m6 about-card">
        <div className="card blue-grey darken-1">
          <div className="card-content white-text">
            <span className="card-title">LightningHosted</span>
            <p>
              LightingHosted is an image hosting service that uses the bitcoin
              lightning network to share advertising revenue with users.
            </p>
          </div>
          <div className="card-action">
            <a
              href="https://twitter.com/LightningHosted"
              className="waves-effect waves-light social-icon btn twitter"
            >
              <i className="fa fa-twitter"></i>
            </a>
            <a
              href="https://github.com/JacksonDMiller/LightningHosted"
              className="waves-effect waves-light social-icon btn twitter"
            >
              <i className="fa fa-github"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="col s12 m6 about-card">
        <div className="card blue-grey darken-1">
          <div className="card-content white-text">
            <span className="card-title">Jackson Miller</span>
            <p>
              LightningHosted is developed by Jackson Miller to give bitcoiners
              a fun space to experiment with the lightning network.{" "}
            </p>
          </div>
          <div className="card-action">
            <a
              href="https://twitter.com/JacksonDMiller"
              className="waves-effect waves-light social-icon btn twitter"
            >
              <i className="fa fa-twitter"></i>
            </a>
            <a
              href="https://github.com/JacksonDMiller"
              className="waves-effect waves-light social-icon btn twitter"
            >
              <i className="fa fa-github"></i>
            </a>
          </div>
        </div>
      </div>

      <ul className="collapsible col s12">
        <li className="active">
          <div className="collapsible-header">How does it work?</div>
          <div className="collapsible-body">
            <span>
              Upload an image you want to share and we will give you a link. The
              link will show your image alongside some bitcoin-related ads. You
              will then receive a portion of the advertising revenue generated
              by those ads.
            </span>
          </div>
        </li>
        <li>
          <div className="collapsible-header">
            What kind of content can I upload?
          </div>
          <div className="collapsible-body">
            <span>
              This service has a zero-tolerance policy against any kind of
              illegal images including using copyrighted images you don't own.
              We also do not allow pornography. As a rule of thumb if it
              wouldn't be acceptable on a California beach it's not acceptable
              here.
            </span>
          </div>
        </li>
        <li>
          <div className="collapsible-header">
            Where can I get a lighting wallet?
          </div>
          <div className="collapsible-body">
            <span>
              There are a number of great lighting wallets but if you are new to
              lightning we recommend
              <a href="https:phoenix.acinq.co/"> Phoenix wallet.</a> However, as
              you learn about lightning you will learn that it has some
              limitations and you may want to move on to a full featured wallet
              in the future.
            </span>
          </div>
        </li>
        <li>
          <div className="collapsible-header">
            Why do I have to pay to upload an image?
          </div>
          <div className="collapsible-body">
            <span>
              We use a small lightning network payment as a deterrent to people
              abusing the service. After the image recevies 100 views the
              satoshis you paid are credited back to your account for
              withdrawal.
            </span>
          </div>
        </li>
        <li>
          <div className="collapsible-header">How can I become a sponsor?</div>
          <div className="collapsible-body">
            <span>
              If you have a Bitcoin-focused project you would like to advertise
              please get in
              <a href="https:twitter.com/LightningHosted"> touch</a> with us.
            </span>
          </div>
        </li>
        <li>
          <div className="collapsible-header">
            How long does it take to get paid?
          </div>
          <div className="collapsible-body">
            <span>
              LightingHosted is in beta so times will vary but we make
              withdrawals available to our users as soon as we are paid by our
              advertisers.
            </span>
          </div>
        </li>
        <li>
          <div className="collapsible-header">Will you add any altcoins?</div>
          <div className="collapsible-body">
            <span>
              No, we believe that bitcoin is the most interesting project with
              the biggest chance of success, and we don't want to dilute it's
              network effects by supporting other more questionable projects.
            </span>
          </div>
        </li>
        <li>
          <div className="collapsible-header">
            Can I open a channel with you?
          </div>
          <div className="collapsible-body">
            <span>
              Of course the more the merrier! URI:
              <textarea
                defaultValue="03404684c9b6902653400af6ff8e2d6024a210a435213a122075def0122ae6d150@35.239.10.189:9735"
                name="Uri"
                id=""
                cols="30"
                rows="10"
              ></textarea>
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}
