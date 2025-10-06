
document.addEventListener('change', async (e) => {
    const confirmDelete = await customConfirm("Do you want to update category?");
    if (!confirmDelete) return;
    const sel = e.target;
    if (!sel.matches('select[data-board-id]')) return;

    const boardId = sel.getAttribute('data-board-id');
    const categoryId = sel.value || null;

    try {

        await $.ajax({
            url: baseURL + "Canvas/SetBoardCategory",
            type: "POST",
            dataType: "json",
            data: {
                DesignBoardId: boardId,
                BoardCategoryId: categoryId ? Number(categoryId) : 0
            },
            success: function (response) {
                HideLoader();
                if (response.result==1)
                    MessageShow('', 'Design Board saved successfully!', 'success');
                else
                    MessageShow(null, 'Failed to save Design Board.', 'error');
            },
            error: function (xhr, status, error) {
                HideLoader();
                console.error("Failed to update image path:", error);
                MessageShow(null, 'Failed to save Design Board.', 'error');
            }
        });

    } catch (err) {
        console.error("Error saving or updating image:", err);
        HideLoader();
    }
});



