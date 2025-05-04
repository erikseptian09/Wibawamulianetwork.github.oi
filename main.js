$(document).ready(function () {
  let pelangganData = JSON.parse(localStorage.getItem('pelangganData')) || [];
  let daftarNama = JSON.parse(localStorage.getItem('daftarNama')) || [];
  let namaTerpakai = pelangganData.map(p => p.nama);

  // Tombol export data
    $('#export-nama-btn').on('click', function () {
  const blob = new Blob([JSON.stringify(daftarNama, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nama-pelanggan.json';
  a.click();
  URL.revokeObjectURL(url);
});

    
    // Tombol import trigger
    $('#import-data-btn').on('click', function () {
      $('#import-data-input').click();
    });
    
    // Handle import file
    $('#import-data-input').on('change', function (event) {
      const file = event.target.files[0];
      if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (importedData.pelangganData && importedData.daftarNama) {
        pelangganData = importedData.pelangganData;
        daftarNama = importedData.daftarNama;
        saveData();
        updateDropdown();
        updateTabel();
        alert('Data berhasil diimpor!');
      } else {
        alert('File tidak valid!');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat memuat file!');
    }
  };
  reader.readAsText(file);
});



  const paketWifi = {
    'Paket Basic': 150000,
    'Paket Standard': 160000,
    'Paket Premium': 170000,
    'Paket Ultra': 200000
  };

  const dataRekening = {
    bca: { nama: 'BCA', rekening: '6088777741 (a.n Toko ASEP JAELANI)' },
    dana: { nama: 'DANA', rekening: '083895300118 (a.n ASEP JAELANI)' },
    bri: { nama: 'BRI', rekening: '084701025669538 (a.n ASEP JAELANI)' },
    mandiri: { nama: 'Mandiri', rekening: '1560017886260 (a.n EUIS JUBAEDAH)' }
  };

  function saveData() {
    localStorage.setItem('pelangganData', JSON.stringify(pelangganData));
    localStorage.setItem('daftarNama', JSON.stringify(daftarNama));
  }

  function loadPaketDropdown() {
    $('#paket-wifi').empty().append(new Option('Pilih Paket', ''));
    Object.keys(paketWifi).forEach(paket => {
      $('#paket-wifi').append(new Option(paket, paket));
    });
  }
  
  $('#biaya').on('input', function () {
  let value = $(this).val().replace(/\D/g, ''); // Hanya angka
  $(this).val(parseInt(value || 0).toLocaleString());
});


  function updateDropdown() {
  $('#nama-pelanggan').empty().append(new Option('Pilih Nama Pelanggan', ''));
  daftarNama.forEach(nama => {
    if (!pelangganData.some(p => p.nama === nama)) {
      $('#nama-pelanggan').append(new Option(nama, nama));
    }
  });
    // Inisialisasi Select2 untuk nama pelanggan
    $('#nama-pelanggan').select2({
      placeholder: 'Pilih Nama Pelanggan',
      allowClear: true,
      width: '100%' // agar responsive
    });
    
  function updateTabel(filteredData = pelangganData) {
    $('#tabel-body').empty();
    let totalBiaya = 0;
    filteredData.forEach((pelanggan, index) => {
      $('#tabel-body').append(`
        <tr>
          <td>${index + 1}</td>
          <td>${pelanggan.nama}</td>
          <td>${pelanggan.paket}</td>
          <td>Rp${pelanggan.biaya.toLocaleString()}</td>
          <td>${pelanggan.status}</td>
          <td>${pelanggan.payment}</td>
          <td>${pelanggan.bank ? pelanggan.bank.toUpperCase() : '-'}</td>
          <td>${pelanggan.tanggal}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-btn" data-index="${index}">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Hapus</button>
          </td>
        </tr>
      `);
      totalBiaya += pelanggan.biaya || 0;
    });
    $('#total-biaya').text(`Total Biaya: Rp${totalBiaya.toLocaleString()}`);
  }

  function resetForm() {
    $('#form-pelanggan')[0].reset();
    $('#nama-pelanggan').val('').trigger('change');
    $('#paket-wifi').val('').trigger('change');
    $('#form-pelanggan').removeData('edit-index');
    $('#simpan-pelanggan').text('Simpan Pelanggan');
    $('#biaya').val('');
  }

  $('#form-pelanggan').on('submit', function (e) {
    e.preventDefault();
    const nama = $('#nama-pelanggan').val();
    const paket = $('#paket-wifi').val();
    const biayaText = $('#biaya').val().replace(/\D/g, '');
    const biaya = parseInt(biayaText);
    const status = $('#status').val();
    const payment = $('#payment').val();
    const bank = payment === 'transfer' ? $('#bank').val() : '';
    const tanggal = $('#tanggal').val();

    if (!nama || !paket || isNaN(biaya) || !status || !payment || (payment === 'transfer' && !bank) || !tanggal) {
      alert('Semua kolom harus diisi!');
      return;
    }

    const pelangganBaru = { nama, paket, biaya, status, payment, bank, tanggal };
    const indexEdit = $(this).data('edit-index');

    if (indexEdit !== undefined) {
      pelangganData[indexEdit] = pelangganBaru;
    } else {
      pelangganData.push(pelangganBaru);
      if (!daftarNama.includes(nama)) daftarNama.push(nama);
    }

    saveData();
    updateTabel();
    updateDropdown();
    resetForm();
  });

  $(document).on('click', '.edit-btn', function () {
    const index = $(this).data('index');
    const pelanggan = pelangganData[index];

    $('#nama-pelanggan').val(pelanggan.nama).trigger('change');
    $('#paket-wifi').val(pelanggan.paket).trigger('change');
    $('#biaya').val(pelanggan.biaya.toLocaleString());
    $('#status').val(pelanggan.status);
    $('#payment').val(pelanggan.payment).trigger('change');
    $('#bank').val(pelanggan.bank);
    $('#tanggal').val(pelanggan.tanggal);

    $('#simpan-pelanggan').text('Update Pelanggan');
    $('#form-pelanggan').data('edit-index', index);
  });

$(document).on('click', '.delete-btn', function () {
  const index = $(this).data('index');
  if (confirm('Yakin ingin menghapus pelanggan ini?')) {
    const namaDihapus = pelangganData[index].nama;
    pelangganData.splice(index, 1);
    saveData();
    // Animasi fadeOut baris
    $(this).closest('tr').fadeOut(400, function () {
      updateTabel();
      updateDropdown();
    });
  }
});


  $('#kelola-nama-btn').on('click', function () {
    $('#modalKelolaNama').modal('show');
    tampilkanListNama();
  });

  function tampilkanListNama() {
    const listNama = daftarNama.map((nama, index) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${nama}</span>
        <div>
          <button class="btn btn-sm btn-primary edit-nama-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger hapus-nama-btn" data-index="${index}">Hapus</button>
        </div>
      </li>
    `).join('');
    $('#list-nama-pelanggan').html(listNama);
  }

  $('#tambah-nama-btn').on('click', function () {
    const namaBaru = $('#nama-input').val().trim();
    if (!namaBaru) {
      alert('Nama tidak boleh kosong!');
      return;
    }

    const sudahAda = daftarNama.some(nama => nama.toLowerCase() === namaBaru.toLowerCase());
    if (sudahAda) {
      alert('Nama sudah ada!');
      return;
    }

    daftarNama.push(namaBaru);
    saveData();
    updateDropdown();

    $('#modalKelolaNama').modal('hide');
    $('#nama-input').val('');
  });

  $(document).on('click', '.hapus-nama-btn', function () {
    const index = $(this).data('index');
    if (confirm('Yakin ingin menghapus nama ini?')) {
      daftarNama.splice(index, 1);
      saveData();
      tampilkanListNama();
      updateDropdown();
    }
  });

  $(document).on('click', '.edit-nama-btn', function () {
    const index = $(this).data('index');
    const namaLama = daftarNama[index];
    const namaBaru = prompt('Edit Nama:', namaLama);

    if (namaBaru && namaBaru.trim() !== '') {
      const sudahAda = daftarNama.some((nama, idx) => idx !== index && nama.toLowerCase() === namaBaru.toLowerCase());
      if (sudahAda) {
        alert('Nama sudah ada!');
        return;
      }

      daftarNama[index] = namaBaru.trim();
      saveData();
      tampilkanListNama();
      updateDropdown();
    }
  });

  $('#filter-tanggal').on('change', function () {
    const filterDate = $(this).val();
    if (filterDate) {
      const filteredData = pelangganData.filter(p => p.tanggal === filterDate);
      updateTabel(filteredData);
    } else {
      updateTabel();
    }
  });

$('#payment').on('change', function () {
    const metode = $(this).val();
    if (metode === 'transfer') {
      $('#bank-section').slideDown();
      $('#rekening-section').hide();
    } else if (metode === 'qris') {
      $('#bank-section').slideUp();
      $('#qris-section').slideDown();
    } else {
      $('#bank-section').hide();
      $('#rekening-section').hide();
    }
  });

  $('#bank').on('change', function () {
    const bank = $(this).val();
    if (dataRekening[bank]) {
      $('#bank-nama').text(dataRekening[bank].nama);
      $('#no-rekening').text(dataRekening[bank].rekening);
      $('#rekening-section').slideDown();
    } else {
      $('#rekening-section').hide();
    }
  });
  
  loadPaketDropdown();
  updateDropdown();
  updateTabel();
});

$('#payment').on('change', function () {
  const metode = $(this).val();
  if (metode === 'qris') {
    $('#qris-section').slideDown(); // tampilkan
  } else {
    $('#qris-section').slideUp(); // sembunyikan
  }
});



  $(window).on('load', function () {
    setTimeout(function () {
      $('#loading-overlay').fadeOut('slow');
    }, 2000);
  });
