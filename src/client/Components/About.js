import React from 'react'
import { useState, useEffect, } from 'react'
import background from '../../assets/bitcoinbackground.jpg'
export default function About() {

    useEffect(() => {
        var elems = document.querySelectorAll('.parallax');
        var instances = M.Parallax.init(elems,);
        console.log('hello')
    }, [])
    return (
        <div>

            <div className="parallax-container">
                <div className="parallax">
                    <img src={background} />
                </div>
                <div>
                    <div className='white-text' >
                        <h2>What is LightningHosted?</h2>
                        <p>LightingHosted is an image hosting service that uses the bitcoin lightning network to
                        share advertising
                 revenue with users.</p>
                    </div>

                </div>




            </div>

            <div >
                <h2>How does it work?</h2>
                <p>Upload an image you want to share and we will give you a link. The link will
                show your image alongside some bitcoin-related ads. You will then receive a portion
                of the advertising revenue generated by those ads.
         </p>
            </div>
            <div >
                <h2>Why do I have to pay to upload an image?</h2>
                <p>We use a small lightning network payment as a deterrent to people abusing the
                service. After the image recevies 100 views the satoshis you paid are credited back
                 to your account for withdrawal.</p>
            </div>
            <div >
                <h2>How can I become a sponsor?</h2>
                <p>If you have a Bitcoin-focused project you would like to advertise please get in
                     <a href="https:twitter.com/LightningHosted">touch</a> with us.
       </p></div>
            <div >
                <h2>What kind of content can I upload?</h2>
                <p>This service has a zero-tolerance policy against any kind of illegal images including using
                copyrighted images you don't own. We also do not allow pornography.
                As a rule of thumb if it wouldn't be acceptable on a California beach it's not
                 acceptable here.</p>
            </div>
            <div >
                <h2>How long does it take to get paid?</h2>
                <p>LightingHosted is in beta so times will vary but we make withdrawals available to
                 our users as soon as we are paid by our advertisers.</p>
            </div>
            <div >
                <h2>Where can I get a lighting wallet?</h2>
                <p>There are a number of great lighting wallets but if you are new to lightning we recommend
                 <a href="https:phoenix.acinq.co/"> Phoenix wallet.</a> However, as you learn about lightning you will learn that
           it has some limitations and you may want to move on to a full featured wallet in the future. </p>
            </div>
            <div >
                <h2>Is it safe?</h2>
                <p>No, both the Lightning Network and especially this service are in beta and mistakes are bound to happen.
                Please
           withdraw often and do not trust this service with any amount of money you would be upset to lose.</p>
            </div>
            <div >
                <h2>Will you add any altcoins?</h2>
                <p>No, we believe that bitcoin is the most interesting project with the biggest chance of success, and we don't want to dilute it's network effects by supporting other more questionable projects.
         </p>
            </div>
        </div>
    )
}


