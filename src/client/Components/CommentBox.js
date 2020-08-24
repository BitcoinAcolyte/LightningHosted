import React, { useState, useContext } from 'react'
import { store } from '../Context/Store';

export default function CommentBox({ imageId, incrementComments, setComments, comments }) {
    const globalState = useContext(store);

    const submitComment = async (e) => {
        e.preventDefault();
        if (globalState.state.auth === false) {
            M.toast({ html: "<a href='/login'>Please Login First</a>" })
        }
        else {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageId: imageId,
                    comment: newComment
                })
            };
            let res = await (await fetch('/api/newcomment/', requestOptions)).json();
            if (res.error) {
                M.toast({ html: res.error })
            }
            else {
                setComments([res.newComment, ...comments]);
                setnewComment('');
                incrementComments();
            }
        }
    }


    const [newComment, setnewComment] = useState('')

    return (
        <div className="row">
            <form className="col s12">
                <div className="row">
                    <div className="input-field col s11">
                        <i className="material-icons prefix">mode_edit</i>
                        <textarea id="icon_prefix2" className="materialize-textarea" onChange={
                            e => setnewComment(e.target.value)} value={newComment}>
                        </textarea>
                        <label htmlFor="icon_prefix2">Write Your Comment</label>
                    </div>
                    <button onClick={submitComment}
                        className="btn waves-effect waves-light col s4 offset-s8 m3 offset-m9 l2 offset-l10 " type="submit" name="action">
                        Submit
                    <i className="material-icons right">send</i>
                    </button>
                </div>
            </form>
        </div>
    )
}
