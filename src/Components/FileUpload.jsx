import React, { useState } from 'react';
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Worker } from '@react-pdf-viewer/core';
import { saveAs } from 'file-saver';
import { PDFDocument } from 'pdf-lib'; // Import the PDFDocument class
import 'bootstrap/dist/css/bootstrap.min.css';


export const FileUpload = () => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [selectPdfFile, setSelectPdfFile] = useState(null);
  const [pdfFileError, setPdfFileError] = useState('');
  const [viewPdf, setViewPdf] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);
  const [newPdfBlob, setNewPdfBlob] = useState(null); // Store the new PDF blob

  const fileObj = ['application/pdf'];

  const handleDownloadPDF = () => {
    if (newPdfBlob) {
      // Trigger the download of the new PDF
      saveAs(newPdfBlob, 'new_pdf_file.pdf');
    }
  };

  const extractAndCombinePages = async () => {
    if (viewPdf && selectedPages.length > 0) {
      try {
        const existingPdfBytes = await fetch(viewPdf).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const combinedPdfDoc = await PDFDocument.create();
        for (const page of selectedPages) {
          const [copiedPage] = await combinedPdfDoc.copyPages(pdfDoc, [page - 1]);
          combinedPdfDoc.addPage(copiedPage);
        }
        const newPdfBytes = await combinedPdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        setNewPdfBlob(blob);
        alert("The selected pages have been successfully extracted");
      } catch (error) {
        console.error('Error creating the new PDF', error);
      }
    }else{
      alert("Select pages to extract")
    }
  };

  const handleFileChange = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && fileObj.includes(selectedFile.type)) {
        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = (e) => {
          setSelectPdfFile(e.target.result);
          setPdfFileError('');
        };
      } else {
        setSelectPdfFile(null);
        setPdfFileError('Please select a valid PDF file');
      }
    } else {
      alert('Select a PDF file');
    }
  };

  const handlePageSelection = (pageNumber) => {
    const updatedSelectedPages = [...selectedPages];
    if (updatedSelectedPages.includes(pageNumber)) {
      const index = updatedSelectedPages.indexOf(pageNumber);
      updatedSelectedPages.splice(index, 1);
    } else {
      updatedSelectedPages.push(pageNumber);
    }
    setSelectedPages(updatedSelectedPages);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(selectPdfFile);
    if (selectPdfFile !== null) {
      setViewPdf(selectPdfFile);
    } else {
      setViewPdf(null);
    }
  };

  return (
    <div className="container">
      <h1>Upload a PDF file</h1>
      <br />
      <form className="form-group" onSubmit={handleSubmit}>
        <input
          type="file"
          name="fileData"
          accept=".pdf"
          className="form-control"
          required
          onChange={handleFileChange}
        />
        {pdfFileError && <div className="error-msg">{pdfFileError}</div>}
        <br />
        <button type="submit" className="btn btn-success btn-lg">
          UPLOAD
        </button>
      </form>
      <br />
      <h4>View PDF</h4>
      <div className="pdf-container">
        {viewPdf && (
          <>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={viewPdf} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
            <div>
              <h5>Select Pages to Extract:</h5>
              {Array.from({ length: 10}, (_, index) => (
                <label key={index}>
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(index + 1)}
                    onChange={() => handlePageSelection(index + 1)}
                  />
                  Page {index + 1}
                </label>
              ))}
            </div>
            <button onClick={extractAndCombinePages} className='btn btn-primary btn-m'>Create New PDF</button>
            <button onClick={handleDownloadPDF} className='btn btn-success btn-m m-3'>Download New PDF</button>
          </>
        )}
        {!viewPdf && <>No PDF file chosen</>}
      </div>
    </div>
  );
};

export default FileUpload;
