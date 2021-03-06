import React from "react";
import { PdfPreview } from "./";
import { ReactComponent as FileIcon } from "../icons/fileIcon.svg";

import { Grid } from "@material-ui/core";
import ChipsInput from "./ChipsInput";

import useStyles from './components/styles/styles'

const classes = useStyles()

const Files = ({ files, handleDeleteChips}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(0);

  const handleChipClick = (attachmentIndex: number) => {
    setCurrentAttachmentIndex(attachmentIndex);
    setPreviewOpen(true);
  };

  return (
    <>
      <Grid item xs={12}>
        <ChipsInput
          isLineType
          type="files"
          label="Attached File:"
          borderType="square"
          onClick={handleChipClick}
          value={files.map((attachment) => attachment?.name || "") || []}
          icon={<FileIcon width={13} height={13} />}
          onDeleteChip={(index) => handleDeleteChips(index)}/>
        {files ? (
          <PdfPreview
            open={previewOpen}
            setOpen={setPreviewOpen}
            files={files as File[]}
            selectedFileIndex={currentAttachmentIndex}
            setFileIndex={setCurrentAttachmentIndex}
          />
        ) : null}
      </Grid>
    </>
  );
};

export default Files;
