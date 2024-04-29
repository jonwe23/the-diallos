import React, { useState, useRef, useEffect } from 'react';
import './createListing.css';

function CreateListing() {
    const [formState, setFormState] = useState({ title: '', price: '', description: '', media: null });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const refs = {
        photo: useRef(null),
        previewContainer: useRef(null)
    };

    useEffect(() => {
        const updatePreviewSize = () => {
            const { previewContainer } = refs;
            const aspectRatio = 16 / 12;
            const width = previewContainer.current.offsetWidth;
            previewContainer.current.style.height = `${width / aspectRatio}px`;
        };

        updatePreviewSize();
        window.addEventListener('resize', updatePreviewSize);
        return () => window.removeEventListener('resize', updatePreviewSize);
    }, [formState.media]);

    const handleChange = (key) => (e) => {
        if (key === 'price') {
            const pattern = /^\d{1,8}(\.\d{0,2})?$/;
            if (pattern.test(e.target.value)) setFormState(prev => ({ ...prev, [key]: e.target.value }));
        } else if (key === 'description') {
            const words = e.target.value.split(/\s+/);
            if (words.length <= 150) setFormState(prev => ({ ...prev, [key]: e.target.value }));
            else alert("Description cannot exceed 150 words.");
        } else {
            setFormState(prev => ({ ...prev, [key]: e.target.value }));
        }
    };

    const handleMediaChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image')) {
            const newMediaItem = {
                type: 'image',
                url: URL.createObjectURL(file),
                aspectRatio: 16 / 12,
            };

            setFormState(prev => ({ ...prev, media: newMediaItem }));
        }
    };

    const handleRemoveImage = () => {
        setFormState(prev => ({ ...prev, media: null }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const listing = { id: Date.now(), ...formState };

        try {
            const response = await fetch('http://localhost:8080/addListing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(listing),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            alert('Listing created successfully!');
            console.log('Success:', data);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create listing');
        }
    };

    return (
        <div className="CreateListing">
            <header className="header">
                <button onClick={() => window.history.back()} className="back-button">X</button>
                <h1>CollectionTracker</h1>
            </header>
            <main className="main-content">
                <aside className="sidebar">
                    <h2>Item for Sale</h2>
                    <div className="buttons-container">
                        <input type="file" ref={refs.photo} style={{ display: 'none' }} accept="image/*" onChange={handleMediaChange} />
                        <button className="button-style" onClick={() => refs.photo.current.click()}>
                            Add Photos
                        </button>
                    </div>
                    <h3>Required</h3>
                    <input type="text" placeholder="Title" className="input-box" value={formState.title} onChange={handleChange('title')} />
                    <input type="number" placeholder="Price" className="input-box" value={formState.price} onChange={handleChange('price')} />
                    <textarea placeholder="Description" className="input-box" value={formState.description} onChange={handleChange('description')} />
                    <button type="submit" className="button-style" onClick={handleSubmit}>Create Listing</button>
                </aside>
                <section id="background">
                    <div className="preview-box">
                        <h2>Preview</h2>
                        <div className="preview-container" ref={refs.previewContainer}>
                            <div className="media-preview" style={{ position: 'relative' }}>
                                {formState.media && (
                                    <img src={formState.media.url} alt="Upload" className="media-item" />
                                )}
                                {formState.media && (
                                    <button className="remove-button" style={{ position: 'absolute', right: '10px', top: '-335px' }} onClick={handleRemoveImage}>X</button>
                                )}
                            </div>
                            <div className="details-preview">
                                <h3>{formState.title || 'Title'}</h3>
                                <p>{formState.price ? `$${formState.price}` : 'Price'}</p>
                                <h3>Details</h3>
                                <p>{formState.description || 'Description will appear here.'}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default CreateListing;
